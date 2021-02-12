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

// Cases requiring a callback
const callbackRequired = [
  'request case closure',
  'add authorized user',
  'employer report lump sum notification',
  'change personal information',
  'cooperation',
  'safety',
  'good cause',
  'interstate'
]

interface RequestFieldValues {
  supportSummary: any,
  filteredRequests: any,
  firstName: any,
  lastName: any,
  phoneNumber: any,
  email: any,
  caseNumber: any,
  company: any,
  newEmployerName: any,
  newEmployerNumber: any,
  employmentChangeType: any
}

export const sendToServiceDesk = async (requestFieldValues: RequestFieldValues) => {
  const rp = await import('request-promise')

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

  const {
    supportSummary,
    filteredRequests,
    firstName,
    lastName,
    phoneNumber,
    email,
    caseNumber,
    company,
    newEmployerName,
    newEmployerNumber,
    employmentChangeType,
  } = requestFieldValues

  const fullName = firstName + lastName
  // Check to see if the support request requires a callback
  const callBackCommitmentType = callbackRequired.includes(
    supportSummary.toLowerCase()
  )
    ? 'Call back'
    : 'None'

  // Format the employment change type
  let formattedEmploymentChange
  let changeType
  if (employmentChangeType) {
    changeType = employmentChangeType.toLowerCase()
  }

  if (changeType === 'loss of employer') {
    formattedEmploymentChange = 'Loss of employer'
  } else if (changeType === 'change of employer') {
    formattedEmploymentChange = 'Change/Add Employer'
  } else if (changeType === 'full time to part time') {
    formattedEmploymentChange = 'Full Time to Part Time'
  } else if (changeType === 'part time to full time') {
    formattedEmploymentChange = 'Part Time to Full Time'
  }

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
    [youngWilliamsNextStep]: 'Young Williams Next Steps Narrative',
    [callBackCommitment]: { value: callBackCommitmentType },
  }

  // The api breaks if a dropdown value is undefined
  let requestObjectToDeliver
  if (!employmentChangeType) {
    requestObjectToDeliver = Object.keys(requestFieldBody).reduce(
      (object, key) => {
        if (key !== employmentSubType) {
          object[key] = requestFieldBody[key]
        }
        return object
      },
      {}
    )
  } else {
    requestObjectToDeliver = requestFieldBody
  }


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
      requestFieldValues: requestObjectToDeliver,
    },
    json: true,
  }

  console.log('Sending Service Request', JSON.stringify(options))

  const serviceRequest = rp.default(options)
    .then(response => {
      return response
    })
    .catch(err => {
      console.error('Unable to connect to Service Desk', err)
      console.log(requestObjectToDeliver)
      return err
    })

  return serviceRequest
}
