require('dotenv').config()
const parseIntentDataFromExcelDocument = require('./parseIntentDataFromExcelDocument')

const fs = require('fs')
require('chai').should()

const AGENT_DIRECTORY = '../agent/intents'

const getAgentIntent = (intentName) => {
    const intent = {
        inputContexts: [],
        outputContexts: [],
        trainingPhrases: []
    }

    const filename = `${AGENT_DIRECTORY}/${intentName}.json`
    if (fs.existsSync(filename)) {
        const agentIntent = require(filename)
        intent.inputContexts.push(...agentIntent.contexts),
            intent.outputContexts.push(...agentIntent.responses[0].affectedContexts.map(ctx => { return { name: ctx.name.trim(), lifespan: ctx.lifespan } }))
        intent.trainingPhrases.push(...getAgentTrainingPhrases(intentName))
    }

    return intent
}

const getAgentTrainingPhrases = (intentName) => {
    const agentTrainingPhrases = []
    const filename = `${AGENT_DIRECTORY}/${intentName}_usersays_en.json`
    if (fs.existsSync(filename)) {
        const agentUserSays = require(filename)
        agentUserSays.forEach(userSay => {
            if (userSay.data) {
                const text = []
                userSay.data.forEach(data => {
                    text.push(data.text)
                })
                agentTrainingPhrases.push((text.join(' ')).trim())
            }
        })
    }

    return agentTrainingPhrases
}

const validateIntentExistences = (spreadSheetIntents) => {
    const agentFiles = []
    console.log('hi')
    fs.readdirSync(AGENT_DIRECTORY).forEach(file => {
        if (!file.endsWith('_usersays_en.json')) {
            agentFiles.push(file.split('/').pop().split('.').shift())
        }
    })

    const spreadSheetIntentNames = Object.keys(spreadSheetIntents)
    
    agentFiles.forEach(agentIntent => {
        it(`Intent [${agentIntent}] exists in the agent and should exist in spreadsheet`, () => {
            spreadSheetIntentNames.includes(agentIntent).should.be.true
        })
    })

    spreadSheetIntentNames.forEach(spreadSheetIntent => {
        it(`Intent [${spreadSheetIntent}] exists in spreadsheet and should exist in agent`, () => {
            agentFiles.includes(spreadSheetIntent).should.be.true
        })
    })

}

const validateInputContexts = (intentName, spreadSheetInputContexts, agentInputContexts) => {
    it(`[${intentName}] should have the same number of input contexts`, () => {
        spreadSheetInputContexts.length.should.equal(agentInputContexts.length)
    })

    spreadSheetInputContexts.forEach(spreadSheetInputContext => {
        it(`[${intentName}] should have input context [${spreadSheetInputContext}] in both the agent and master spreadsheet`, () => {
            agentInputContexts.includes(spreadSheetInputContext).should.be.true
        })
    })
}

const validateOutputContexts = (intentName, spreadSheetOutputContexts, agentOutputContexts) => {
    it(`[${intentName}] should have the same number of output contexts`, () => {
        spreadSheetOutputContexts.length.should.equal(agentOutputContexts.length)
    })

    spreadSheetOutputContexts.forEach(spreadSheetOutputContext => {
        it(`[${intentName}] should have output context [${spreadSheetOutputContext.name} (${spreadSheetOutputContext.lifespan})] in both the agent and master spreadsheet`, () => {
            const matchingOutputContextName = agentOutputContexts.find(agentOutputContext => agentOutputContext.name === spreadSheetOutputContext.name)
            spreadSheetOutputContext.name.should.equal(matchingOutputContextName.name)
        })

        it(`[${intentName}] should have output context [${spreadSheetOutputContext.name} (${spreadSheetOutputContext.lifespan})] in both the agent and master spreadsheet with matching lifespan`, () => {
            const matchingOutputContextLifespan = agentOutputContexts.find(agentOutputContext => agentOutputContext.name === spreadSheetOutputContext.name && agentOutputContext.lifespan === spreadSheetOutputContext.lifespan)
            spreadSheetOutputContext.lifespan.should.equal(matchingOutputContextLifespan.lifespan)
        })
    })
}

const validateTrainingPhrases = (intentName, spreadSheetTrainingPhrases, agentTrainingPhrases) => {
    it(`[${intentName}] should have the same number of training phrases`, () => {
        spreadSheetTrainingPhrases.length.should.equal(agentTrainingPhrases.length)
    })

    spreadSheetTrainingPhrases.forEach(spreadSheetTrainingPhrase => {
        it(`[${intentName}] should have training phrase [${spreadSheetTrainingPhrase}] in both the agent and master spreadsheet`, () => {
            agentTrainingPhrases.includes(spreadSheetTrainingPhrase).should.be.true
        })
    })
}

const validateIntent = (intentName, intentData) => {
    const agentIntent = getAgentIntent(intentName)
    validateInputContexts(intentName, intentData.inputContexts, agentIntent.inputContexts)
    validateOutputContexts(intentName, intentData.outputContexts, agentIntent.outputContexts)
    validateTrainingPhrases(intentName, intentData.trainingPhrases, agentIntent.trainingPhrases)
    
}

describe('Gen Reconciliation Testing', () => {
    const intents = parseIntentDataFromExcelDocument('./Master spreadsheet.xlsx', 'intent_context_content')
    describe('Verify intents exist in both sources', () => {
        validateIntentExistences(intents)
    })
    
    Object.entries(intents).forEach(([intentName, intentData]) => {
        describe(`Validating Intent ${intentName}`, () => {
            validateIntent(intentName, intentData)
        })
    })
})
