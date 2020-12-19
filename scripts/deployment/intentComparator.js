const fs = require('fs')

module.exports = class IntentComparator {
  constructor(intentName, currentIntentsDirectory, updatedIntentsDirectory) {
    this.intentName = intentName
    this.currentIntentsDirectory = currentIntentsDirectory
    this.updatedIntentsDirectory = updatedIntentsDirectory
  }

  compare() {
    let isUnmodified = false

    // Check to see if an intent has been added or removed
    isUnmodified = (fs.existsSync(`${this.currentIntentsDirectory}/${this.intentName}.json`) == fs.existsSync(`${this.updatedIntentsDirectory}/${this.intentName}.json`))
      || (fs.existsSync(`${this.currentIntentsDirectory}/${this.intentName}_usersays_en.json`) == fs.existsSync(`${this.updatedIntentsDirectory}/${this.intentName}_usersays_en.json`))

    // Check to see if the training phrases have been modified
    if (isUnmodified && fs.existsSync(`${this.currentIntentsDirectory}/${this.intentName}_usersays_en.json`)) {
      const currentIntentTrainingPhrases = require(`${this.currentIntentsDirectory}/${this.intentName}_usersays_en.json`)
      const updatedIntentTrainingPhrases = require(`${this.updatedIntentsDirectory}/${this.intentName}_usersays_en.json`)

      // If the number of phrases has changed, we immediately know it's been modified
      isUnmodified = (currentIntentTrainingPhrases.length == updatedIntentTrainingPhrases.length)
      if (isUnmodified) {
        let currentTrainingData = []
        for (const index in currentIntentTrainingPhrases) {
          currentTrainingData.push(JSON.stringify(currentIntentTrainingPhrases[index].data[0].text))
        }

        // Let's compare all of the training phrases
        for (const index in updatedIntentTrainingPhrases) {
          isUnmodified = currentTrainingData.find(currentTrainingPhrase => {
            return currentTrainingPhrase === JSON.stringify(updatedIntentTrainingPhrases[index].data[0].text)
          }) !== undefined

          // As soon as we see a difference exit the loop
          if (!isUnmodified)
            break
        }
      }
    }

    return isUnmodified
  }
}