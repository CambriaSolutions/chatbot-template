const xlsx = require('xlsx')

const splitTrimTextRegex = (phrase, regex) => {
  const trainingPhrases = []
  const splitTrainingPhrases = ''.concat(phrase).split(regex)
  splitTrainingPhrases.forEach(splitPhrase => {
    const phrase = splitPhrase.trim();
    if (phrase.length > 0) {
      trainingPhrases.push(phrase)
    }
  })
  return trainingPhrases
}

const splitTrimText = (phrase, delimiter, keepDelimiter) => {
  const trainingPhrases = []
  const splitTrainingPhrases = ''.concat(phrase).split(delimiter)
  splitTrainingPhrases.forEach(splitPhrase => {
    const phrase = splitPhrase.trim();
    if (phrase.length > 0) {
      if (keepDelimiter) {
        trainingPhrases.push(phrase.concat(delimiter))
      } else {
        trainingPhrases.push(phrase)
      }
    }
  })
  return trainingPhrases
}

const parseInputContexts = (data) => {
  const inputContexts = []
  if (data) {
    const parsedOutputContexts = splitTrimTextRegex(data, /\n/g)
    parsedOutputContexts.forEach(parsedOutputContext => {
      const preppedContext = parsedOutputContext.replace(';', '');
      inputContexts.push(preppedContext)
    })
  }

  return inputContexts
}

const parseOutputContexts = (data) => {
  const outputContexts = []
  if (data) {
    const parsedOutputContexts = splitTrimTextRegex(data, /\r\n/g)
    parsedOutputContexts.forEach(parsedOutputContext => {
      let preppedContext = parsedOutputContext.replace(';', '');
      let lifespan = 0
      if (preppedContext.match(/\([0-9]+\)/)) {
        lifespan = parseInt(preppedContext.substring(preppedContext.indexOf('(') + 1, preppedContext.indexOf(')') - preppedContext.indexOf('(') + 1))
        preppedContext = (preppedContext.substring(preppedContext.indexOf(')') + 1, preppedContext.length)).trim()
      }

      outputContexts.push({
        name: preppedContext,
        lifespan: lifespan
      })
    })
  }

  return outputContexts
}

const parseTrainingPhrases = (data) => {
  if (data) {
    const trainingPhrases = []
    const splitPhrases = splitTrimText(data, '\n', false)
    splitPhrases.forEach(splitPhrase => {
      if (splitPhrase.match(/\r\n/g)) {
        const newlineSplitPhrases = splitTrimTextRegex(splitPhrase, /\r\n/g)
        newlineSplitPhrases.forEach(newlineSplitPhrase => {
          if (newlineSplitPhrase.length > 1) {
            newlineSplitPhrase = newlineSplitPhrase.replace(' ,', '')
            trainingPhrases.push(newlineSplitPhrase)
          }
        })

      } else {
        if (splitPhrase.length > 1) {
          splitPhrase = splitPhrase.replace(' ,', '')
          trainingPhrases.push(splitPhrase)
        }
      }
    })
    return trainingPhrases
  } else {
    return []
  }
}

const parseIntentData = (sheetData) => {
  const intentData = {}
  sheetData.forEach(data => {
    const intentName = data['Intent name']
    intentData[intentName] = {
      content: data['Content'],
      inputContexts: parseInputContexts(data['Context']),
      outputContexts: parseOutputContexts(data['Output context']),
      trainingPhrases: parseTrainingPhrases(data['Training phrases'])
    }
  })

  return intentData
}

const parseIntentDataFromExcelDocument = (excelFile, sheetName) => {
  const workbook = xlsx.readFile(excelFile)
  const sheetNames = workbook.SheetNames;
  if (sheetNames.includes(sheetName)) {
    var sheetData = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName]);
    return parseIntentData(sheetData)
  } else {
    throw `${sheetName} not found. Document had [${sheetNames}]`
  }
}

module.exports = parseIntentDataFromExcelDocument