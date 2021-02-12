// Retrieve suggestion text to display to users depending on the categetory/intent mapping
const retrieveIntentData = async category => {
  const admin = await import('firebase-admin')
  const { get } = await import('lodash')
  const camelCase = await import('camelcase')
  const db = admin.firestore()

  // Format the category returned from ml models to match our db naming convention
  const formattedCategory = camelCase.default(category)

  // Create a reference for the mlCategory collection and retrieve the intent name
  // to reference the intent collection
  try {
    const categoryDocRef = db.collection('mlCategories').doc(formattedCategory)
    const categoryDoc = await categoryDocRef.get()
    const categoryData = categoryDoc.data()
    const suggestionText = get(categoryData, 'suggestionText')

    if (suggestionText) {
      return {
        mlCategory: category,
        suggestionText
      }
    } else {
      return
    }
  } catch (err) {
    console.error(err.message, err)
  }
}

export const mapCategoryToIntent = async categories => {
  // Create an array of db queries for each category returned from the ml models
  const promises = categories.map(async category => {
    return retrieveIntentData(category)
  })
  const suggestionResults = await Promise.all(promises)

  return suggestionResults.filter(suggestion => suggestion !== undefined)
}
