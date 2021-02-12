require('dotenv').config()
const format = require('date-fns/format')
const admin = require('firebase-admin')
const fs = require('fs')

admin.initializeApp()

const store = admin.firestore()
// Default fallback intent ID - DEV and PROD
//const intentId = 'd832e961-7c6c-4b00-a608-88a5c1c3f3f5'

const getHandledPhrases = async (startDate, endDate, fLog, fPhrases, subjectMatter) => {
  return store
    .collection(
      `/subjectMatters/${subjectMatter}/requests/`
    )
    .orderBy('createdAt', 'asc')
    .where('createdAt', '>=', startDate)
    .where('createdAt', '<', endDate)
    // //.where('intentId', '==', intentId)
    // .where('queryResult.intent.displayName', '==', 'Default Fallback Intent')
    //.where('createdAt', '>', new Date(2020, 1, 1, 0, 0, 0, 0))
    .get()
    .then(values => {
      fs.writeSync(fLog, `-S- Fetched intents for date range: ${format(startDate, 'MM-dd-yyyy')} - ${format(endDate, 'MM-dd-yyyy')}\n`)
      fs.writeSync(fLog, 'Number of results:' + values.docs.length + '\n')

      console.log(`-S- Fetched intents for date range: ${format(startDate, 'MM-dd-yyyy')} - ${format(endDate, 'MM-dd-yyyy')}`)
      console.log('Number of results:', values.docs.length)


      for (let query of values.docs) {
        try {

          const queryDoc = query.data()
          const queryText = queryDoc.queryResult.queryText
          const createdAt = queryDoc.createdAt.toDate()
          const createdAtFormatted = format(createdAt, 'MM-dd-yyyy')
          const intentDisplayName = queryDoc.queryResult.intent.displayName

          fs.writeSync(fPhrases, `"${queryText}","${intentDisplayName}","${createdAtFormatted}","${subjectMatter}"\n`)
        } catch (e) {
          // eat the error
          fs.writeSync(fLog, `Error - Query Text: (${query.data().queryResult.queryText}), Intent Display Name: (${query.data().queryResult.intent.displayName}), Created At: (${query.data().createdAt})\n`)
          console.log(e.message)
        }
      }

      fs.writeSync(fLog, `-F- Finished writing for date range: ${format(startDate, 'MM-dd-yyyy')} - ${format(endDate, 'MM-dd-yyyy')}`)
    })
}

const main = async () => {
  const fLog = fs.openSync('All-log.csv', 'w')
  const fPhrases = fs.openSync('HandledPhrases.csv', 'w')

  const getAllHandledPhrases = async (subjectMatter) => {

    for (var i = 0; i <= 9; i++) {
      const startDate = new Date(2020, i, 1, 0, 0, 0, 0)
      const endDate = new Date(2020, i + 1, 0, 0, 0, 0, 0)

      await getHandledPhrases(startDate, endDate, fLog, fPhrases, subjectMatter)
    }
  }

  await getAllHandledPhrases('cse')
  await getAllHandledPhrases('tanf')
  await getAllHandledPhrases('snap')
  await getAllHandledPhrases('wfd')
  await getAllHandledPhrases('general')

  fs.close(fPhrases, async () => {
    console.log('File completed writing')
  })

  fs.close(fLog, () => {
    console.log('Log file completed writing')
  })
}

main()