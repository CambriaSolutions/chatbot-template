import fs from 'fs'
import { globalIntentHandlers } from './intentHandlers/globalIntentHandlers'
import { commonIntentHandlers } from './intentHandlers/commonIntentHandlers'
import { childSupportIntentHandlers } from './intentHandlers/childSupportIntentHandlers'
import { map, filter } from 'lodash'

const intentHandlers = {
  ...globalIntentHandlers,
  ...commonIntentHandlers,
  ...childSupportIntentHandlers,
  // Overriding the fallback intent so we don't extract the automl handler
  'Default Fallback Intent': () => { }
}

function parameters() {
  this.supportType = '**SUPPORT TYPE**'
  this.phoneNumber = '**PHONE NUMBER**'
  this.supportSummary = '**SUPPORT SUMMARY**'
  this.employmentStatus = '**EMPLOYMENT STATUS**'
  this.email = '**EMAIL ADDRESS**'
  this.newEmployerPhone = '**NEW EMPLOYER PHONE**'
  this.newEmployerName = '**NEW EMPLOYER NAME'
  this.lastName = '**LAST NAME**'
  this.firstName = '**FIRST NAME**'
  this.companyName = '**COMPANY NAME**'
  this.caseNumber = '**CASE NUMBER**'
  this.retirementContributions = 0
  this.isSupporting = 'YES'
  this.inArrears = 'YES'
  this.disposableIncome = 0
  this.childSupportRequests = '**CHILDSUPPORT REQUESTS**'
  this.request = '**REQUEST**'
}

function context() {
  this.contexts = []
  this.get = () => {
    console.warn('--- Current handler is trying to access contexts! ---')
  }
  this.set = (ctx) => {
    this.contexts.push(ctx)
  }
}

function agent() {
  this.UNSPECIFIED = 'PLATFORM_UNSPECIFIED'
  this.parameters = new parameters()
  // this.FACEBOOK = 'FACEBOOK',
  // this.SLACK = 'SLACK',
  // this.TELEGRAM = 'TELEGRAM',
  // this.KIK = 'KIK',
  // this.SKYPE = 'SKYPE',
  // this.LINE = 'LINE',
  // this.VIBER = 'VIBER',
  // this.ACTIONS_ON_GOOGLE = 'ACTIONS_ON_GOOGLE',
  this.phrases = []
  this.suggestions = []
  this.add = (phrase) => {
    if (phrase.replies) {
      this.suggestions.push(...phrase.replies)
    } else {
      this.phrases.push(phrase)
    }
  }
  this.context = new context()
}

const getIntentFileNames = (agentDirectory) => {
  const intents = []
  fs.readdirSync(`${agentDirectory}/intents`).forEach(function (file) {
    const filename = file.split('/').pop()
    if (!filename.endsWith('_usersays_en.json')) {
      intents.push(`${agentDirectory}/intents/${file}`)
    }
  })

  return intents
}

const getTrainingPhrases = (intentFile) => {
  const userSays = require(intentFile.replace('.json', '_usersays_en.json'))
  const trainingPhrases = []
  userSays.forEach((record) => {
    let phrase = ''
    record.data.forEach((data) => {
      phrase += data.text
    })
    trainingPhrases.push(phrase)
  })

  return trainingPhrases
}

const getResponseData = async (intentName) => {
  const handler = intentHandlers[intentName]
  const agt = new agent()

  agt.handleEndConversation = false

  await handler(agt)

  return {
    phrases: agt.phrases,
    suggestions: agt.suggestions,
    contexts: agt.context.contexts,
    handleEndConversation: agt.handleEndConversation
  }
}

const generateOutputFile = async (intentFile) => {
  const intent = require(intentFile)

  const responseData = await getResponseData(intent.name)

  const output = {
    id: intent.id,
    intentName: intent.name,
    inputContexts: intent.contexts,
    trainingPhrases: getTrainingPhrases(intentFile),
    responsePhrases: responseData.phrases,
    suggestions: responseData.suggestions,
    handleEndConversation: responseData.handleEndConversation,
    outputContexts: []
  }

  output.responsePhrases =
    output.suggestions =
    output.handleEndConversation =

    output.outputContexts = []
  responseData.contexts.forEach((handlerAffectedContext) => {
    handlerAffectedContext.actor = 'code'
    output.outputContexts.push(handlerAffectedContext)
  })

  if (intent.responses) {
    intent.responses.forEach((response => {
      if (response.affectedContexts) {
        response.affectedContexts.forEach((dialogflowAffectedContext) => {
          dialogflowAffectedContext.actor = 'dialogflow'
          output.outputContexts.push(dialogflowAffectedContext)
        })
      }
    }))
  }

  return output
}

//fs.writeFileSync(handlerFile, content);

const constructMessage = text => ({
  'type': '0',
  'title': '',
  'textToSpeech': '',
  'lang': 'en',
  'speech': [
    text
  ],
  'condition': ''
})

const constructIntentFileContents = (intentData) => (
  {
    'id': intentData.id,
    'name': intentData.intentName,
    'auto': true,
    'contexts': intentData.inputContexts,
    'responses': [
      {
        'resetContexts': false,
        'action': '',
        'affectedContexts': map(intentData.outputContexts, c => ({ name: c.name, lifespan: c.lifespan, parameters: {} })),
        'parameters': [],
        'messages': [
          ...map(intentData.responsePhrases, p => constructMessage(p)),
          {
            'type': '4',
            'title': '',
            'payload': {
              'suggestions': intentData.suggestions,
              'handleEndConversation': !!intentData.handleEndConversation
            },
            'textToSpeech': '',
            'lang': 'en',
            'condition': ''
          }
        ],
        'speech': []
      }
    ],
    'priority': 500000,
    'webhookUsed': true,
    'webhookForSlotFilling': false,
    'fallbackIntent': false,
    'events': [],
    'conditionalResponses': [],
    'condition': '',
    'conditionalFollowupEvents': []
  }
)

const doExtract = async () => {
  const intents = getIntentFileNames('../../../agent')

  const intentPartialName = 'cse-dirDep'

  await filter(intents, x => x.split('/').pop().split('.')[0].indexOf(intentPartialName) >= 0).forEach(async (intent) => {
    try {
      const pathElements = intent.split('/')
      const intentName = pathElements.pop().split('.')[0]
      console.log(intentName)
      if (!intent.includes('handleUnhandled') && intentHandlers[intentName]) {
        const extract = await generateOutputFile(intent)
        const intentFileContents = constructIntentFileContents(extract)
        fs.writeFileSync(`../../../content/${extract.intentName}.json`, JSON.stringify(intentFileContents, null, 4), 'utf-8')
      }
    } catch (err) {
      const pathElements = intent.split('/')
      const intentName = pathElements.pop().split('.')[0]
      fs.writeFileSync(`../../../content/ERROR-${intentName}-ERROR.txt`, err.message, 'utf-8')
    }
  })
}

doExtract()
  .then(() => {
    console.log('done')
  })
  .catch(err => {
    console.error(err)
  })