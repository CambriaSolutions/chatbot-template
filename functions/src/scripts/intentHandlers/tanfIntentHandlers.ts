import { tanfRoot } from '../../intentHandlers/tanf/tanfRoot'
import { eligibilityChecker } from '../../intentHandlers/common/eligibilityChecker'
import { mapRoot } from '../../intentHandlers/common/map'
import { pebtRoot } from '../../intentHandlers/common/pebt'

export const tanfIntentHandlers = {
  'tanf-root': tanfRoot,
  'tanf-eligibilityChecker': eligibilityChecker,
  'tanf-pebt-root': pebtRoot,

  // Map
  'tanf-map-root': mapRoot('tanf')
}