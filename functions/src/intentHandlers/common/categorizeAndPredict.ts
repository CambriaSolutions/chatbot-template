import dotenv from 'dotenv'
dotenv.config()

// Mapping ML categories to intent suggestions
import { mapCategoryToIntent } from './mapCategoryToIntent'

// Query the category model to return category predictions
const predictCategories = async (location, projectId, catModel, query) => {
  const automl = await import('@google-cloud/automl')
  // Instantiate autoML client
  const client = new automl.v1beta1.PredictionServiceClient()

  // Define the location of the category prediction model
  const categoryModelPath = client.modelPath(
    projectId,
    location,
    catModel
  )

  const payload = {
    textSnippet: {
      content: query,
      mime_type: 'text/plain',
    },
  }

  const catRequest = {
    name: categoryModelPath,
    payload: payload,
  }

  // Client predictions return all categories sorted by highest classification score (percent confidence),
  // with the highest first. For our purposes, we only return the top three
  const catResponses = await client.predict(catRequest)
  return {
    predictionType: 'categories',
    categories: {
      category1: {
        name: catResponses[0].payload[0].displayName,
        confidence: catResponses[0].payload[0].classification.score,
      },
      category2: {
        name: catResponses[0].payload[1].displayName,
        confidence: catResponses[0].payload[1].classification.score,
      },
      category3: {
        name: catResponses[0].payload[2].displayName,
        confidence: catResponses[0].payload[2].classification.score,
      },
    },
  }
}

// Query both models to determine
// 1. Is this applicable to the subject matter we handle?
// 2. What category is the query most likely to match?
const categorizeAndPredict = async (db, projectId, subjectMatter, query) => {
  const categories = []

  const autoMlSettings = (await db.collection('subjectMatters').doc(subjectMatter).get()).data()
  const predictions = await predictCategories(autoMlSettings.location, projectId, autoMlSettings.catModel, query)
  for (const category in predictions.categories) {
    const { name, confidence } = predictions.categories[category]

    if (confidence > autoMlSettings.confidenceThreshold) {
      categories.push(name)
    }
  }

  return categories

}

export const autoMlFallback = async (agent: Agent) => {
  try {
    const { Suggestion } = await import('dialogflow-fulfillment')
    const { defaultFallback } = await import('../globalFunctions')
    const { getSubjectMatter } = await import('../../utils/getSubjectMatter')
    const admin = await import('firebase-admin')
    const projectId = admin.instanceId().app.options.projectId
    const db = admin.firestore()

    const { query } = agent
    let categories
    // If agent.parameters.mlCategories is populated, it means this intent is being fired by the "go-back" intent, so the 
    // categories have already been fetched. No need to fetch them again. 
    if (agent.parameters.mlCategories !== undefined) {
      categories = agent.parameters.mlCategories
    } else {
      // Send the user's query to interact with our custom machine learning models
      const subjectMatter = getSubjectMatter(agent)
      categories = await categorizeAndPredict(db, projectId, subjectMatter, query)

      // Save the categories to the agent parameters because if we click "go back" we will need them to display them again.
      agent.parameters.mlCategories = categories
    }

    // If there are categories returned, attempt to map them to intents,
    // and present them to the user as suggestions
    if (categories.length > 0) {
      // Use the ML categories to retrieve associated suggestions from the db
      const suggestions = await mapCategoryToIntent(categories)

      if (suggestions.length > 0) {
        await agent.add(
          'I\'m sorry, were you referring to one of the topics below?'
        )

        suggestions.forEach(async (suggestion: { suggestionText: string }) => {
          if (suggestion.suggestionText) {
            await agent.add(new Suggestion(`${suggestion.suggestionText}`))
          }
        })

        await agent.add(new Suggestion('None of these'))

        // Save the query and suggestion and intent collection in context for
        // further analysis on the analytics end
        await agent.context.set({
          name: 'should-inspect-for-ml',
          lifespan: 1,
          parameters: {
            originalQuery: query,
            suggestions: suggestions,
          },
        })
      } else {
        // The query did not return any suggestions
        // handle with default fallback language
        await defaultFallback(agent)
      }
    }
  } catch (err) {
    console.error('Unable to generate suggestions', err)
  }
}
