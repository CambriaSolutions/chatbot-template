require('dotenv').config()

const admin = require('firebase-admin')

admin.initializeApp()

// Connect to DB
const store = admin.firestore()

// Function adds each of the subject matters as a document in the database settings collection
// and sets default values. 
const updateDatabaseSettings = async () => {
  const settingsRef = store.collection(`settings`)
  const oldSettingsBackupRef = store.collection(`oldSettingsBackup`)

  const settings = await settingsRef.get()

  const createDefaults = name => ({
    id: name,
    name: name,
    primaryColor: '#323342',
    timezone: {
      offset: -5,
      name: '(UTC-07:00) Pacific Time (US & Canada)'
    }
  })

  const subjectMatters = ['general', 'cse', 'tanf', 'snap']

  // Remove any settings that are not a valid subject matter.
  settings.forEach(doc => {
    if (subjectMatters.indexOf(doc.id) === -1) {
      // We store the previous settings in a collection called 'oldSettingsBackup' in case anything goes wrong.
      oldSettingsBackupRef.doc(doc.id).set(doc.data())

      settingsRef.doc(doc.id).delete()
    }
  })

  subjectMatters.forEach(sm => {
    settingsRef.doc(sm).set(createDefaults(sm))
  })
}

updateDatabaseSettings()