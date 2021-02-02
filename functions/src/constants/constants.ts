import { map } from 'lodash'
import coordinatesSet1 from '../coordinates/coordinatesSet1.json'

export const subjectMatters = [
  'mscj'
]

export const subjectMatterLabels = [
  'Mississippi Center for Justice'
]

export const subjectMatterContexts = map(subjectMatters, sm => `${sm}-subject-matter`)

// We can separate coordinates used based on subject matters when required

// TODO: Change this to match locations nearby.
export const subjectMatterLocations = {
  'set': coordinatesSet1
}