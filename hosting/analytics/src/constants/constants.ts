import { map } from 'lodash'

export const subjectMatters = [
  'mscj',
]

export const subjectMatterLabels = [
  'Mississippi Center for Justice',
]

export const subjectMatterContexts = map(subjectMatters, (sm: any) => `${sm}-subject-matter`)