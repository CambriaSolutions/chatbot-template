require('dotenv').config()
const fs = require('fs')
const dialogflow = require('@google-cloud/dialogflow')
const JSZip = require('jszip')

const keyFile = require(process.env.GOOGLE_APPLICATION_CREDENTIALS)
const projectId = keyFile.project_id
const client = new dialogflow.v2.AgentsClient()
const zip = new JSZip()

zip.file('package.json', fs.readFileSync('../../agent/package.json'))
zip.file('agent.json', fs.readFileSync('../../agent/agent.json'))

const intentFiles = fs.readdirSync('../../agent/intents')
intentFiles.forEach(intentFile => {
  zip
    .folder('intents')
    .file(intentFile, fs.readFileSync(`../../agent/intents/${intentFile}`))
})

const entityFiles = fs.readdirSync('../../agent/entities')
entityFiles.forEach(entityFile => {
  zip
    .folder('entities')
    .file(entityFile, fs.readFileSync(`../../agent/entities/${entityFile}`))
})

zip.generateAsync({ type: 'uint8array' })
  .then(function (content) {
    console.log('Agent files zipped')
    client.restoreAgent({ parent: `projects/${projectId}`, agentContent: content })
      .then(responses => {
        const [operation] = responses
        // Operation#promise starts polling for the completion of the LRO.
        return operation.promise()
      })
      .then(() => {
        console.log('Imported')
        return
      })
      .catch(err => {
        throw err
      })
  })
  .catch(err => {
    console.error(err)
    process.exitCode = 1
  })