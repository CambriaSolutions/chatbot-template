require('dotenv').config()
const request = require('request')

const serviceDeskFields = {
  environment: 'customfield_10109',
  division: 'customfield_10140',
  reporterFullName: 'customfield_10158',
  reporterPhoneNumber: 'customfield_10144',
  reporterEmail: 'customfield_10087',
  reporterCaseNumber: 'customfield_10146',
  message: 'customfield_10149',
  channel: 'customfield_10139',
  companyName: 'customfield_10111',
  employer: 'customfield_10136',
  employerPhoneNumber: 'customfield_10137',
  employmentSubType: 'customfield_10148',
  youngWilliamsNextStep: 'customfield_10155',
  callBackCommitment: 'customfield_10156',
}

const fullName = '<Firstname> <Lastname>'
const caseNumber = '<Casenumber>'
const phoneNumber = '9163264446'
const email = '<email>'
const supportSummary = 'Request Payment History or Record'
const filteredRequests = 'test Description'
const company = 'Lump Sum company'

// New fields
const newEmployerName = 'employer'
const newEmployerNumber = '(916)799-0766'
const employmentChangeType = 'loss of employer'

const callbackRequired = [
  'request case closure',
  'add authorized user',
  'employer report lump sum notification',
  'change personal information',
]

const callBackCommitmentType = callbackRequired.includes[
  supportSummary.toLowerCase()
]
  ? 'Call back'
  : 'None'

let formattedEmploymentChange
if (employmentChangeType === 'loss of employer') {
  formattedEmploymentChange = 'Loss of employer'
} else if (employmentChangeType === 'change of employer') {
  formattedEmploymentChange = 'Change/Add Employer'
} else if (employmentChangeType === 'full time to part time') {
  formattedEmploymentChange = 'Full Time to Part Time'
} else if (employmentChangeType === 'part time to full time') {
  formattedEmploymentChange = 'Part Time to Full Time'
}

const {
  environment,
  division,
  reporterFullName,
  reporterPhoneNumber,
  reporterEmail,
  reporterCaseNumber,
  youngWilliamsNextStep,
  callBackCommitment,
  message,
  channel,
  companyName,
  employer,
  employerPhoneNumber,
  employmentSubType,
} = serviceDeskFields

const requestFieldBody = {
  [environment]: { value: process.env.SERVICE_DESK_ENV },
  [division]: { value: 'Child Support Services' },
  [reporterFullName]: fullName,
  [reporterPhoneNumber]: phoneNumber,
  [reporterEmail]: email,
  [reporterCaseNumber]: caseNumber,
  summary: supportSummary,
  [employmentSubType]: { value: formattedEmploymentChange },
  [message]: filteredRequests,
  [channel]: {
    value: 'Genbot',
  },
  [companyName]: company,
  [employer]: newEmployerName,
  [employerPhoneNumber]: newEmployerNumber,
  [youngWilliamsNextStep]: 'Young Williams Next Steps Narative',
  [callBackCommitment]: { value: callBackCommitmentType },
}

let objectToDeliver
if (typeof phoneNumber !== 'number') {
  objectToDeliver = Object.keys(requestFieldBody).reduce((object, key) => {
    if (key !== reporterPhoneNumber) {
      object[key] = requestFieldBody[key]
    }
    return object
  }, {})
} else {
  objectToDeliver = requestFieldBody
}

const sendToServiceDesk = async fieldValues => {
  const options = {
    method: 'POST',
    uri: process.env.SERVICE_DESK_URI,
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      Authorization: process.env.SERVICE_DESK_KEY,
    },
    body: {
      serviceDeskId: process.env.SERVICE_DESK_ID,
      requestTypeId: process.env.REQUEST_TYPE_ID,
      requestFieldValues: fieldValues,
    },
    json: true,
  }

  request(options, function (error, response, body) {
    if (error) throw new Error(error)
    console.log(
      'Response: ' + response.statusCode + ' ' + response.statusMessage
    )
    console.log(body)
  })
}
sendToServiceDesk(objectToDeliver)
