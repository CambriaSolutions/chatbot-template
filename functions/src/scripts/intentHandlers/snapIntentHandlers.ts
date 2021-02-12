import { snapRoot } from '../../intentHandlers/snap/snapRoot'
import { eligibilityChecker } from '../../intentHandlers/common/eligibilityChecker'
import { mapRoot } from '../../intentHandlers/common/map'
import { pebtRoot } from '../../intentHandlers/common/pebt'

export const snapIntentHandlers = {
  'snap-root': snapRoot,
  'snap-eligibilityChecker': eligibilityChecker,
  'snap-pebt-root': pebtRoot,

  // Map
  'snap-map-root': mapRoot('snap')
}