const intentRenamingMappings = {
  'Default Welcome Intent': 'welcome-home',
  'global-restart': 'cse-snap-tanf-wfd-restart',
  'map-deliver-map': 'return-officelocations',
  'Default Fallback Intent': 'no-content',
  'cse-pmts-general-root': 'cse-payments-general-root',
  'cse-map-root': 'cse-officelocations-root',
  'cse-dirDep-start': 'cse-directdeposit-start',
  'cse-dirDep-root': 'cse-directdeposit-root',
  'cse-root': 'childsupport-root',
  'cse-iwoQA-arrears-balance': 'cse-arrears-balance-support ticket',
  'cse-iwo-when-to-begin': 'cse-income-withholding-order-when-to begin',
  'cse-iwo-root': 'cse-income-withholding-order-root',
  'cse-dirDep-stop': 'cse-directdeposit-stop',
  'snap-map-root': 'snap-officelocations',
  'tanf-map-root': 'tanf-officelocations',
  'wfd-map-root': 'wfd-officelocations',
}

export const renameIntent = (currentIntentName) => {
  const renamedIntent = intentRenamingMappings[currentIntentName]
  return renamedIntent ? renamedIntent : currentIntentName
}