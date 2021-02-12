import { Suggestion } from 'dialogflow-fulfillment'
import { handleEndConversation } from '../globalFunctions'

const taxOffsetGuideLink = '<a href="https://www.mdhs.ms.gov/wp-content/uploads/2020/04/MDHS_CSE_Tax-Offset-Guide.pdf" target="_blank">click here</a>'
/**
 * Intent: enforcement-
 *
 * @param {*} agent
 */
export const enforcementRoot = async (agent: Agent) => {
  try {
    await agent.add(
      'MDHS has multiple enforcement tools to enforce child support orders. Click on one of the suggestions below to learn more.'
    )
    await agent.add(new Suggestion('License Suspension/Reinstatement'))
    await agent.add(new Suggestion('Tax Offset'))
    await agent.add(new Suggestion('Liens'))
    await agent.add(new Suggestion('Settlements'))
    await agent.add(new Suggestion('Passport Revocation'))
    await agent.add(new Suggestion('Credit Bureau Reporting'))
    await agent.add(new Suggestion('Unemployment Benefits'))
    await agent.add(new Suggestion('Bankruptcy'))
    await agent.add(new Suggestion('Income Withholding Order Information'))
    await agent.add(new Suggestion('Contempt'))
  } catch (err) {
    console.error(err.message, err)
  }
}

/**
 * Intent: enforcement-license-suspension-and-reinstatement
 * Training phrases: { "Can I get license revoked?", "Why was my license revoked?", "How can I get my license reinstated?" }
 *
 * @param {*} agent
 */
export const enforcementLicenseSuspensionReinstatement = async (agent: Agent) => {
  try {
    await agent.add(
      'MDHS may suspend driver\'s licenses and professional licenses to enforce child support when arrears are owed.'
    )
    await agent.add(
      'To learn more about when a license may be suspended or how to get a suspended license reinstated, select one of the options below.'
    )
    await agent.add(new Suggestion('License Suspension'))
    await agent.add(new Suggestion('License Reinstatement'))
    await agent.context.set({
      name: 'waiting-license-suspension-learn-more',
      lifespan: 3,
    })
    await agent.context.set({
      name: 'waiting-license-reinstatement-learn-more',
      lifespan: 3,
    })
  } catch (err) {
    console.error(err.message, err)
  }
}

/**
 * Intent: enforcement-license-suspension
 * Training phrases: { "License Suspension" }
 *
 * @param {*} agent
 */
export const enforcementLicenseSuspension = async (agent: Agent) => {
  try {
    await agent.add(
      'Generally, after 30 days of non-payment a license suspension notice will automatically be sent to the parent who owes support. The parent who owes support has 90 days to become current or enter into a payment arrangement to avoid suspension. If the parent who owes support does not comply, the license is subject to suspension.'
    )
    await agent.add(
      'If the parent who owes support previously entered into a court-approved payment arrangement and fails to make payments in accordance with that arrangement, a notice is not required and the 90 days does not apply. The license is subject to immediate suspension.'
    )
    await handleEndConversation(agent)
  } catch (err) {
    console.error(err.message, err)
  }
}

/**
 * Intent: enforcement-license-suspension-repeat-two
 * Training phrases: { "What if their license has been suspended before for non-payment?" }
 *
 * @param {*} agent
 */
export const enforcementLicenseSuspensionNonCompliance = async (agent: Agent) => {
  try {
    await agent.add(
      'Generally, after 30 days of non-payment a license suspension notice will automatically be sent to the parent who owes support. The parent who owes support has 90 days to become current or enter into a payment arrangement to avoid suspension. If the parent who owes support does not comply, the license is subject to suspension.'
    )
    await agent.add(
      'If the parent who owes support previously entered into a court-approved payment arrangement and fails to make payments in accordance with that arrangement, a notice is not required and the 90 days does not apply. The license is subject to immediate suspension.'
    )
    await handleEndConversation(agent)
  } catch (err) {
    console.error(err.message, err)
  }
}

/**
 * Intent: enforcement-license-reinstatement
 * Training phrases: { "License Reinstatement" }
 *
 * @param {*} agent
 */
export const enforcementLicenseReinstatement = async (agent: Agent) => {
  try {
    await agent.add(
      'To reinstate a suspended license, the parent who owes support either has to become current on support owed, or enter into a payment agreement with MDHS.'
    )
    await agent.add(new Suggestion('Submit Inquiry for Reinstatement'))
    await agent.context.set({
      name: 'waiting-enforcement-submit-inquiry',
      lifespan: 2,
    })
  } catch (err) {
    console.error(err.message, err)
  }
}

/**
 * Intent: enforcement-tax-offset
 * Training phrases: { " Taxes " }
 *
 * @param {*} agent
 */
export const enforcementTaxOffset = async (agent: Agent) => {
  try {
    await agent.add(
      `Generally, if a parent has been certified for tax offset, a portion of the taxes may be offset unless there is a joint tax return filed. If a joint tax return is filed, it may take up to 6 months for any federal (IRS) offset payment to be applied. State Tax Collections are distributed after a 30 day hold period. Please ${taxOffsetGuideLink} to access the guide.`
    )

    await handleEndConversation(agent)
  } catch (err) {
    console.error(err.message, err)
  }
}

// Q1
export const enforcementTaxOffsetQ1 = async (agent: Agent) => {
  try {
    await agent.add(
      'Tax Offset is the interception of the federal and/or state income tax refunds of a parent who is responsible for paying child support. It is a primary method for the collection of child support arrears. This collection method is used to collect past due child support, spousal support, and medical support.'
    )

    await handleEndConversation(agent)
  } catch (err) {
    console.error(err.message, err)
  }
}

// Q2/Q3
export const enforcementTaxOffsetQ2Q3 = async (agent: Agent) => {
  try {
    await agent.add(
      `MDHS sends child support arrears information electronically to the appropriate federal and state agencies for cases meeting the federal and state tax offset thresholds. These agencies withhold tax refunds up to the amount of the arrearage reported, and send the funds to MDHS. For more information ${taxOffsetGuideLink}.`
    )

    await handleEndConversation(agent)
  } catch (err) {
    console.error(err.message, err)
  }
}

// Q4
export const enforcementTaxOffsetQ4 = async (agent: Agent) => {
  try {
    await agent.add(
      `This varies by the type of refund and the type of arrears owed. For information regarding the Federal IRS tax offset refund and State income tax offset refund, please ${taxOffsetGuideLink} for the Child Support Tax Offset Guide.`
    )

    await handleEndConversation(agent)
  } catch (err) {
    console.error(err.message, err)
  }
}

// Q5
export const enforcementTaxOffsetQ5 = async (agent: Agent) => {
  try {
    await agent.add(
      `The IRS has very specific guidelines that require state child support agencies to safeguard federal tax information. For more information ${taxOffsetGuideLink}.`
    )

    await handleEndConversation(agent)
  } catch (err) {
    console.error(err.message, err)
  }
}

// Q6
export const enforcementTaxOffsetQ6 = async (agent: Agent) => {
  try {
    await agent.add(
      `<u>Federal IRS tax offset:</u> You will receive a letter from the federal government (Department of the Treasury, Bureau of the Fiscal Service) informing you that your tax refund has been offset and the amount of the offset. 
      <br/><u>State income tax offset:</u> If your state tax refund has been offset, you will receive a notice from the Mississippi Department of Revenue. For more information ${taxOffsetGuideLink}.`
    )

    await handleEndConversation(agent)
  } catch (err) {
    console.error(err.message, err)
  }
}

// Q7
export const enforcementTaxOffsetQ7 = async (agent: Agent) => {
  try {
    await agent.add(
      `There are three reasons to dispute a tax offset: <ul><li>If you are not the person listed on the Notice.</li><li>If the Notice contains an incorrect social security number.</li><li>If you do not believe you owe past-due child support.</li></ul> For more information ${taxOffsetGuideLink}.`
    )

    await handleEndConversation(agent)
  } catch (err) {
    console.error(err.message, err)
  }
}

// Q8
export const enforcementTaxOffsetQ8 = async (agent: Agent) => {
  try {
    await agent.add(
      'If a joint tax return is filed, it may take up to <strong>six (6) months</strong> for any federal (IRS) offset payment to be applied. State tax collections are distributed after a <strong>thirty (30) day</strong> hold period. This allows the spouse of the parent responsible for support to appeal as an injured spouse.'
    )

    await handleEndConversation(agent)
  } catch (err) {
    console.error(err.message, err)
  }
}

// Q9
export const enforcementTaxOffsetQ9 = async (agent: Agent) => {
  try {
    await agent.add(
      'If you are the spouse of the person responsible for child support, you may file an <a href="https://www.irs.gov/pub/irs-pdf/f8379.pdf" target="_blank">IRS Form 8379</a> with the IRS for federal taxes.\
      For state taxes, once you receive notification from the MS Department of Revenue, you may request a review by submitting a request in writing to:\
      <br/>MS Department of Human Services Attention: Child Support Tax Offset\
      <br/>P.O. Box 352\
      <br/>Jackson, MS 39205'
    )
    await agent.add(`For more information, ${taxOffsetGuideLink}.`)

    await handleEndConversation(agent)
  } catch (err) {
    console.error(err.message, err)
  }
}

// Q10
export const enforcementTaxOffsetQ10 = async (agent: Agent) => {
  try {
    await agent.add(
      `Yes. If a joint tax return is filed and the spouse of the parent who owes support agrees to voluntarily waive his or her right to claim a portion of the federal income tax return, the parent who owes support and his/her spouse must complete the <a href="https://www.mdhs.ms.gov/wp-content/uploads/2020/03/Revised-Injured-Spouse-Form-Instructions-Final-03.24.20.pdf" target="_blank">Injured Spouse Waiver</a> to release a joint IRS tax refund. Once completed, this form shall be emailed or mailed to:
      <br/>Email:&nbsp;mdhs.childsupport@mdhs.ms.gov
      <br/>Mail: MS Department of Human Services
      <br/>Attention: Child Support Tax Offset
      <br/>P.O. Box 352
      <br/>Jackson, MS 39205`
    )

    await handleEndConversation(agent)
  } catch (err) {
    console.error(err.message, err)
  }
}

/**
 * Intent: enforcement-liens
 * Training phrases: { "Liens", "Bank Accounts", etc }
 *
 * @param {*} agent
 */
export const enforcementLiens = async (agent: Agent) => {
  try {
    await agent.add(
      'Funds in financial accounts may be seized for past due child support. Generally, MDHS receives this information through various sources and sends notice of lien to the bank, court, and the parent who owes support.'
    )
    await agent.add(new Suggestion('Contest an existing Lien'))
    await agent.add(
      new Suggestion('Provide information on a financial account')
    )
  } catch (err) {
    console.error(err.message, err)
  }
}
/**
 * Intent: enforcement-contest-lien
 * Training phrases: { "Contest an existing Lien " }
 *
 * @param {*} agent
 */
export const enforcementContestLien = async (agent: Agent) => {
  try {
    await agent.add(
      'Funds are held at the financial institution for 45 days to allow the account holder(s) to contest the lien by alleging mistaken identity or fact in regards to the child support account. Please submit a request or call <a href="tel:+18778824916">1-877-882-4916</a> to contest the lien. Please do NOT provide your financial account information in the request below.'
    )
    await agent.add(new Suggestion('Submit Inquiry'))
    await handleEndConversation(agent)
    await agent.context.set({
      name: 'waiting-enforcement-submit-inquiry',
      lifespan: 2,
    })
  } catch (err) {
    console.error(err.message, err)
  }
}

/**
 * Intent: enforcement-financial-account-update-case
 * Training phrases: { "Provide information on a financial account" }
 *
 * @param {*} agent
 */
export const enforcementFinancialAccountUpdateCase = async (agent: Agent) => {
  try {
    await agent.add(
      'If you have information about the financial accounts of the parent who owes support, please call <a href="tel:+18778824916">1-877-882-4916</a> to update your case. Please do NOT provide financial account information through this platform.'
    )
    await handleEndConversation(agent)
  } catch (err) {
    console.error(err.message, err)
  }
}

/**
 * Intent: enforcement-personal-injury
 * Training phrases: { "Settlements", "Personal injury", "Workman's comp" }
 *
 * @param {*} agent
 */
export const enforcementPersonalInjury = async (agent: Agent) => {
  try {
    await agent.add(
      'MDHS may offset personal injury or workers\' compensation settlements. MDHS receives information about the settlements from various sources and works to negotiate payment settlements.'
    )
    await agent.add(
      'Do you have information about a workers\' compensation or personal injury settlement?'
    )
    await agent.add(new Suggestion('Yes'))
    await agent.add(new Suggestion('No'))
    await agent.context.set({
      name: 'waiting-enforcement-settlements-update-case',
      lifespan: 1,
    })
    await agent.context.set({
      name: 'waiting-enforcement-settlements-no-update-case',
      lifespan: 1,
    })
  } catch (err) {
    console.error(err.message, err)
  }
}

/**
 * Intent: enforcement-settlements-update-case
 * Training phrases: { "Update case settlements"}
 *
 * @param {*} agent
 */
export const enforcementSettlementsUpdateCase = async (agent: Agent) => {
  try {
    await agent.add(
      'If you have information about settlements that the parent who owes support may receive, please click below to update your case.'
    )
    await agent.add(new Suggestion('Update Case'))
    await agent.context.set({
      name: 'waiting-enforcement-submit-inquiry',
      lifespan: 2,
    })
  } catch (err) {
    console.error(err.message, err)
  }
}

/**
 * Intent: enforcement-passport-revocation
 * Training phrases: { "Passport revoked" }
 *
 * @param {*} agent
 */
export const enforcementPassportRevocation = async (agent: Agent) => {
  try {
    await agent.add(
      'If the parent who owes support owes more than $2,500 in child support, an automatic notification is sent to the federal government to prevent the issuance or renewal of a passport.'
    )
    await agent.add(new Suggestion('How do I get my passport reinstated?'))
  } catch (err) {
    console.error(err.message, err)
  }
}
/**
 * Intent: enforcement-passport-reinstatement
 * Training phrases: { "How do I get my passport reinstated?" }
 *
 * @param {*} agent
 */
export const enforcementPassportReinstatement = async (agent: Agent) => {
  try {
    await agent.add(
      'A passport may be reinstated when the amount of support owed is less than $2,500. In very limited circumstances, MDHS has discretion to negotiate with the parent who owes support to remove the passport hold.'
    )

    // The client has not requested this suggestion, but it makes sense to include
    await agent.add(new Suggestion('Submit Inquiry'))
    await agent.context.set({
      name: 'waiting-enforcement-submit-inquiry',
      lifespan: 2,
    })
    await handleEndConversation(agent)
  } catch (err) {
    console.error(err.message, err)
  }
}
/**
 * Intent: enforcement-credit-bureau-reporting
 * Training phrases: { "Credit Bureau Reporting Credit Score" }
 *
 * @param {*} agent
 */
export const enforcementCreditBureauReporting = async (agent: Agent) => {
  try {
    await agent.add(
      'MDHS automatically sends notice to the major credit bureaus when the parent who owes support is delinquent more than 60 days.'
    )
    await agent.add(new Suggestion('What if this was done in error?'))
  } catch (err) {
    console.error(err.message, err)
  }
}

/**
 * Intent: enforcement-unemployment
 * Train phrases: { "How will my unemployment benefits be impacted?" }
 *
 * @param {*} agent
 */
export const enforcementUnemployment = async (agent: Agent) => {
  try {
    await agent.add(
      'MDHS partners with the MS Dept. of Employment Security to withhold child support payments from unemployment benefits.'
    )
    await handleEndConversation(agent)
  } catch (err) {
    console.error(err.message, err)
  }
}

export const enforcementSettlementsNoUpdateCase = async (agent: Agent) => {
  try {
    await handleEndConversation(agent)
  } catch (err) {
    console.error(err.message, err)
  }
}

/**
 * Intent: enforcement-report-error
 * Training phrases: { "What if this was done in error?" }
 *
 * @param {*} agent
 */
export const enforcementReportError = async (agent: Agent) => {
  try {
    await agent.add(
      'The parent who owes support may dispute the DHS claim with the credit bureaus or request MDHS to review their case if they believe the report was made in error. To have your case reviewed, click "Submit Inquiry for Review" below.'
    )
    await agent.add(new Suggestion('Submit Inquiry for Review'))
    await agent.context.set({
      name: 'waiting-enforcement-submit-inquiry',
      lifespan: 2,
    })
  } catch (err) {
    console.error(err.message, err)
  }
}

export const enforcementSubmitInquiry = async (agent: Agent) => {
  try {
    const { supportInquiries } = await import('./support')

    await supportInquiries(agent)
  } catch (err) {
    console.error(err.message, err)
  }
}

/**
 * Intent: enforcement-bankruptcy
 *
 * @param {*} agent
 */
export const enforcementBankruptcy = async (agent: Agent) => {
  try {
    await agent.add(
      'If a parent who owes child support files Chapter 13 bankruptcy, MDHS can file a claim with the bankruptcy court and seek to have child support payments included in the bankruptcy plan.'
    )
    await handleEndConversation(agent)
  } catch (err) {
    console.error(err.message, err)
  }
}

/**
 * Intent: enforcement-contempt
 *
 * @param {*} agent
 */
export const enforcementContempt = async (agent: Agent) => {
  try {
    await agent.add(
      'After all other appropriate enforcement actions have been attempted and an ability to pay assessment has been conducted, MDHS may petition the court to hold the parent who owes support in contempt.This may result in the incarceration of the parent who owes support until a lump sum payment is made on his/her behalf.'
    )
    await agent.add(
      'If you would like to submit a request for contempt action on your case, please select "Request Contempt Action" below.'
    )
    await agent.add(new Suggestion('Request Contempt Action'))
  } catch (err) {
    console.error(err.message, err)
  }
}

