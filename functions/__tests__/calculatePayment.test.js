const { calculatePayment } = require('../calculatePayment')

describe('Payment Estimator', () => {
  test('Should throw an error if options are missing', () => {
    expect(() => {
      calculatePayment(123)
    }).toThrow()
  })

  test('Should throw an error if partial children are used', () => {
    expect(() => {
      const opts = {
        numChildren: 1.5,
        incomeTerm: 'annual',
        grossIncome: 50000,
        taxDeductions: 500,
        ssDeductions: 500,
        retirementContributions: 500,
        otherChildSupport: 0,
      }
      calculatePayment(opts)
    }).toThrow()
  })

  test('Should calculate correctly for annual income', () => {
    const opts = {
      numChildren: 1,
      incomeTerm: 'monthly',
      grossIncome: 12000,
      taxDeductions: 1000,
      ssDeductions: 1000,
      retirementContributions: 500,
      otherChildSupport: 400,
    }
    expect(calculatePayment(opts)).toBe(1274)
  })

  test('Should calculate correctly for annual income and no retirement contributions', () => {
    const opts = {
      numChildren: 3,
      incomeTerm: 'annual',
      grossIncome: 25000,
      taxDeductions: 3000,
      ssDeductions: 1500,
      retirementContributions: 0,
      otherChildSupport: 1000,
    }
    expect(calculatePayment(opts)).toBe(156)
  })

  test('Should calculate correctly for annual income, no retirement contributions & no existing child support', () => {
    const opts = {
      numChildren: 1,
      incomeTerm: 'annual',
      grossIncome: 75000,
      taxDeductions: 3000,
      ssDeductions: 1500,
      retirementContributions: 0,
      otherChildSupport: 0,
    }
    expect(calculatePayment(opts)).toBe(823)
  })

  test('Should calculate correctly for matched child count', () => {
    const opts = {
      numChildren: 3,
      incomeTerm: 'annual',
      grossIncome: 100000,
      taxDeductions: 20000,
      ssDeductions: 5000,
      retirementContributions: 5000,
      otherChildSupport: 5000,
    }
    expect(calculatePayment(opts)).toBe(183)
  })

  test('Should calculate correctly for overflow child count', () => {
    const opts = {
      numChildren: 12,
      incomeTerm: 'annual',
      grossIncome: 100000,
      taxDeductions: 20000,
      ssDeductions: 5000,
      retirementContributions: 5000,
      otherChildSupport: 5000,
    }
    expect(calculatePayment(opts)).toBe(217)
  })

  test('Should calculate correctly for monthly income', () => {
    const opts = {
      numChildren: 1,
      incomeTerm: 'monthly',
      grossIncome: 1200,
      taxDeductions: 100,
      ssDeductions: 100,
      retirementContributions: 50,
      otherChildSupport: 200,
    }
    expect(calculatePayment(opts)).toBe(105)
  })

  test('Should calculate correctly for weekly income', () => {
    const opts = {
      numChildren: 2,
      incomeTerm: 'weekly',
      grossIncome: 1384.62,
      taxDeductions: 100,
      ssDeductions: 100,
      retirementContributions: 50,
      otherChildSupport: 400,
    }
    expect(calculatePayment(opts)).toBe(897)
  })

  test('Should calculate correctly for biweekly income', () => {
    const opts = {
      numChildren: 5,
      incomeTerm: 'biweekly',
      grossIncome: 2769.23,
      taxDeductions: 100,
      ssDeductions: 100,
      retirementContributions: 50,
      otherChildSupport: 200,
    }
    expect(calculatePayment(opts)).toBe(1363)
  })
})
