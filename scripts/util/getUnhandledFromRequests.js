require('dotenv').config()
const format = require('date-fns/format')
const admin = require('firebase-admin')
const fs = require('fs')

admin.initializeApp()

const store = admin.firestore()
const subjectMatter = 'cse'
// Default fallback intent ID - DEV and PROD
//const intentId = 'd832e961-7c6c-4b00-a608-88a5c1c3f3f5'

store
  .collection(
    `/subjectMatters/${subjectMatter}/requests/`
  )
  .orderBy('createdAt', 'asc')
  //.where('intentId', '==', intentId)
  //.where('queryResult.intent.displayName', '==', 'Default Fallback Intent')
  .where('createdAt', '>=', new Date(2020, 6, 22, 0, 0, 0, 0))
  .where('createdAt', '<=', new Date(2020, 6, 23, 0, 0, 0, 0))
  .get()
  .then(values => {
    console.log('Number of results:', values.docs.length)
    let f = fs.openSync(`./${subjectMatter}_unhandledQueries.csv`, 'w')

    for (let query of values.docs) {
      const queryDoc = query.data()
      const queryText = queryDoc.queryResult.queryText
      const createdAt = queryDoc.createdAt.toDate()
      const createdAtFormatted = format(createdAt, 'MM-dd-yyyy')
      const intentDisplayName = queryDoc.queryResult.intent.displayName

      fs.writeSync(f, `${queryText}\n`)
      console.log(`Query Text: (${queryText}), Intent Display Name: (${intentDisplayName}), Created At: (${createdAtFormatted})`)
    }

    fs.close(f, async () => {
      console.log('File completed writing')
    })
  })
