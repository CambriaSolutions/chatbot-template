const intentRenamingMappings = {
  'Default Welcome Intent': 'welcome-home',
  'global-restart': 'mscj-restart',
  'map-deliver-map': 'return-officelocations',
  'Default Fallback Intent': 'no-content',
  'mscj-map-root': 'mscj-officelocations',
}

export const renameIntent = (currentIntentName) => {
  const renamedIntent = intentRenamingMappings[currentIntentName]
  return renamedIntent ? renamedIntent : currentIntentName
}