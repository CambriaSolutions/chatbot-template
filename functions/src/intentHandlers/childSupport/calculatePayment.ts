// Determine the ratio multiplier required to convert income from
// any cadence to monthly. For example:
// Income: 1,000
// Cadence: biweekly
// Multiplier: 26 (26 payments in a year)
// Annual Income: 26,000
const getIncomeMultiplier = cadence => {
  // We can only collect income in one of the below cadences
  const allowedCadences = ['weekly', 'biweekly', 'monthly', 'annual']
  if (!allowedCadences.includes(cadence)) {
    throw new Error(
      `${cadence} is not an allowed cadence for estimating payments`
    )
  }

  switch (cadence) {
    case 'weekly':
      return 52
    case 'biweekly':
      return 26
    case 'monthly':
      return 12
    case 'annual':
      return 1
    default:
      return null
  }
}

// Determine what percentage of annual income is required to be
// contributed toward child support payments
const getSupportBracket = async numChildren => {
  const { isNumber } = await import('lodash')

  if (!isNumber(numChildren)) {
    throw new Error('numChildren must be a number for estimation')
  }
  if (numChildren < 1) {
    throw new Error('Must have at least 1 child for estimation')
  }
  if (numChildren % 1 !== 0) {
    throw new Error('Number of children must be a whole integer')
  }
  const pctBrackets = {
    1: 0.14,
    2: 0.2,
    3: 0.22,
    4: 0.24,
  }
  const highPct = 0.26
  const percentage = pctBrackets[numChildren]
    ? pctBrackets[numChildren]
    : highPct

  return percentage
}

// Validate that deductions aren't higher than the income before estimating child support obligations
export const validateIncomeAndDeductions = ({
  incomeTerm,
  grossIncome,
  taxDeductions = 0,
  ssDeductions = 0,
  retirementContributions = 0,
  otherChildSupport = 0,
}) => {
  const cadenceMultiplier = getIncomeMultiplier(incomeTerm)

  // Convert income from provided cadence to annual
  const annualIncome = grossIncome * cadenceMultiplier

  return (
    annualIncome -
    taxDeductions -
    ssDeductions -
    retirementContributions -
    otherChildSupport >
    0
  )
}

// Simple child support estimation based on annual income,
// number of children, and arrears payments
export const calculatePayment = async ({
  numChildren,
  incomeTerm,
  grossIncome,
  taxDeductions,
  ssDeductions,
  retirementContributions,
  otherChildSupport,
}) => {
  // Get the percentage of income that should be paid per year
  const bracketPct = await getSupportBracket(numChildren)

  // Get the multiplier to adjust payment to a monthly cadence, e.g. if
  // user provided bi-weekly income, we need to multiply by 2 to get
  // monthly income
  const cadenceMultiplier = getIncomeMultiplier(incomeTerm)
  if (cadenceMultiplier === null) {
    throw new Error(
      'There was a problem determining the multiplier for payment estimation'
    )
  }

  // Adjust existing Child Support Obligations as they are only collected
  // as a monthly ammount
  let csObligations
  if (incomeTerm === 'annual') {
    csObligations = otherChildSupport * 12
  } else if (incomeTerm === 'biweekly') {
    csObligations = otherChildSupport / 2
  } else if (incomeTerm === 'weekly') {
    csObligations = otherChildSupport / 4
  } else {
    csObligations = otherChildSupport
  }

  const adjustedGrossIncome =
    grossIncome -
    taxDeductions -
    ssDeductions -
    retirementContributions -
    csObligations
  // Convert adjusted gross income from provided cadence to annual
  const annualAdjustedIncome = adjustedGrossIncome * cadenceMultiplier

  // Determine the annual child support contribution
  const annualPayment = annualAdjustedIncome * bracketPct

  // Convert annual to monthly payment
  const monthlyPayment = annualPayment / 12

  // Only return whole numbers
  const totalPayment = Math.round(monthlyPayment)

  return totalPayment
}
