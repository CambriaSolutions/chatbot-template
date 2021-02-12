require('dotenv').config()

const admin = require('firebase-admin')
admin.initializeApp()
const db = admin.firestore()

const addUser = async (userId, isAdmin, canExportData, defaultSubjectMatter, availableSubjectMatters) => {
  const userData = {
    admin: isAdmin,
    dataExport: canExportData,
    defaultSubjectMatter: defaultSubjectMatter,
    subjectMatters: availableSubjectMatters
  }

  await db.collection('users').doc(userId).set(userData)
}

const sms = ['general', 'cse', 'snap', 'tanf']

addUser('UserGUID', true, true, 'cse', sms)





