require('dotenv').config()
const admin = require('firebase-admin')
const { v4: uuidv4 } = require('uuid')
const fs = require('fs')

admin.initializeApp()

const projectId = 'mdhs-csa-dev'

console.log(projectId)

// Needs actual phrases to query
const unhandledQueries = ['A test query']

// Instantiate a Dialogflow client.
const dialogflow = require('dialogflow')

const sessionClient = new dialogflow.SessionsClient()

const mapQueryToSuggestions = async (queryText) => {
  const sessionId = uuidv4()
  const sessionPath = sessionClient.sessionPath(projectId, sessionId)
  const dfRequest = {
    queryParams: {
      contexts: [{
        'name': `projects/mdhs-csa-dev/agent/sessions/${sessionId}/contexts/cse-subject-matter`,
        'lifespanCount': 1,
        'parameters': {}
      }]
    },
    queryInput: {
      text: {
        text: queryText,
        languageCode: 'en-US'
      }
    },
    session: sessionPath
  }

  const detectIntentResponses = await sessionClient.detectIntent(dfRequest)

  const mlContext = detectIntentResponses[0].queryResult.outputContexts.find(x => x.name.indexOf('should-inspect-for-ml') > -1)

  if (mlContext) {
    const suggestions = mlContext.parameters.fields.suggestions.listValue.values.map(x => x.structValue.fields.suggestionText.stringValue)

    console.log('suggestions: ', suggestions)

    return `"${queryText}","${suggestions[0]}","${suggestions[1]}","${suggestions[2]}"\n`
  } else {
    return ''
  }
}

let mappedQueries = ''

const file = './mappedQueries.csv'

// Runs all unhandled queries against the agent in order to identify unhandled queries for testing.
// If a query is not unhandled, it will simply ignore it.
const mapQueries = async (unhandledQueries) => {
  for (var i = 0; i <= unhandledQueries.length - 1; i++) {
    try {

      const result = await mapQueryToSuggestions(unhandledQueries[i])

      if (result.length > 0) {
        mappedQueries += result
        console.log(mappedQueries)
      }

      if (i === unhandledQueries.length - 1) {
        const f1 = fs.openSync(file, 'w')

        const f2 = fs.writeSync(f1, mappedQueries.toString())

        fs.close(f2, async () => {
          console.log('mapQueriesToIntents finished')
        })
      }
    } catch (e) {
      console.log(`Failed for ${unhandledQueries[i]}: `, e)
    }
  }
}

// Need to pass in a list of queries to run against Dialogflow
mapQueries(unhandledQueries)