require('dotenv').config()

const admin = require('firebase-admin')

admin.initializeApp()

// Connect to DB
const store = admin.firestore()

// Function adds the required 'defaultSubjectMatter' and 'subjectMatter' properties to the 
// database for each user. 
const updateUserSettings = async () => {
  const usersRef = store.collection(`users`)
  const oldUsersBackupRef = store.collection(`oldUsersBackup`)

  const users = await usersRef.get()
  const subjectMatters = ['general', 'cse', 'tanf', 'snap']

  users.forEach(async doc => {
    // By destructuring like this, we remove projects and defaultProject and keep all 
    // the other properties inside a new object called dataToPersist
    const { projects, defaultProject, ...dataToPersist } = doc.data()

    // We store the previous settings in a collection called 'oldUsersBackup' in case anything goes wrong.
    oldUsersBackupRef.doc(doc.id).set(doc.data())

    usersRef.doc(doc.id).set({
      ...dataToPersist,
      defaultSubjectMatter: 'cse',
      subjectMatters: subjectMatters
    })
  })
}

updateUserSettings()