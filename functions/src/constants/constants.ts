import { map } from 'lodash'
import coordinatesSet1 from '../coordinates/coordinatesSet1.json'
import coordinatesSet2 from '../coordinates/coordinatesSet2.json'

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

export const subjectMatterContexts = map(subjectMatters, sm => `${sm}-subject-matter`)

// SNAP, TANF, WFD have the same locations. CSE locations are separate.
export const subjectMatterLocations = {
  'cse': coordinatesSet1,
  'snap': coordinatesSet2,
  'tanf': coordinatesSet2,
  'wfd': coordinatesSet2
}