import { map } from 'lodash'

export const subjectMatters = [
  'cse',
  'tanf',
  'snap',
  'wfd'
]

export const subjectMatterLabels = [
  'Child Support',
  'TANF',
  'SNAP',
  'Workforce Development'
]

export const subjectMatterContexts = map(subjectMatters, (sm: any) => `${sm}-subject-matter`)