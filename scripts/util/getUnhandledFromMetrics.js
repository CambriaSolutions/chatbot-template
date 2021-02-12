require('dotenv').config()

const fs = require('fs')
const admin = require('firebase-admin')

admin.initializeApp()

const db = admin.firestore()
const startDate = new Date('2020-10-18')
const endDate = new Date('2020-10-25')

const getMetrics = async (subjectMatter) => {
  const dbRef = await db.collection(`subjectMatters/${subjectMatter}/metrics`)
    .where('date', '>=', startDate)
    .where('date', '<', endDate)
    .get()
  let f = fs.openSync(`./${subjectMatter}_unhandledQueries.csv`, 'w')
  const fallbacksMap = new Map()
  dbRef.docs.forEach(doc => {
    const metric = doc.data()
    if (metric.fallbackTriggeringQueries) {
      metric.fallbackTriggeringQueries.forEach(fallbackTriggeringQuery => {
        fs.writeSync(f, `${fallbackTriggeringQuery.queryText},${doc.id}\n`)
        console.log(`Query Text: (${fallbackTriggeringQuery.queryText}), Created At: (${doc.id})`)
      })
    }
  })
  fs.close(f, async () => {
    console.log('File completed writing')
  })
  return fallbacksMap
}

const run = async () => {
  await getMetrics('cse')
  await getMetrics('wfd')
  await getMetrics('snap')
  await getMetrics('tanf')
}

run()
