export const detectBrowser = (userAgentString) => {
  // Detect Chrome 
  let chromeAgent =
    userAgentString.indexOf('Chrome') > -1 || userAgentString.indexOf('CriOS') > -1

  // Detect Internet Explorer 
  let IExplorerAgent =
    userAgentString.indexOf('MSIE') > -1 ||
    userAgentString.indexOf('rv:') > -1

  // Detect Firefox 
  const firefoxAgent =
    userAgentString.indexOf('Firefox') > -1

  // Detect Safari 
  let safariAgent =
    userAgentString.indexOf('Safari') > -1

  // Detect Edge 
  const edgeAgent =
    userAgentString.indexOf('Edge') > -1

  // Discard IE since it also matches Firefox 
  if ((IExplorerAgent) && (firefoxAgent))
    IExplorerAgent = false

  // Discard Safari since it also matches Chrome 
  if ((chromeAgent) && (safariAgent))
    safariAgent = false

  // Detect Opera 
  const operaAgent =
    userAgentString.indexOf('OP') > -1

  // Discard Chrome since it also matches Opera      
  if ((chromeAgent) && (operaAgent))
    chromeAgent = false

  // Discard Chrome and Safari since it also matches Edge      
  if (edgeAgent) {
    chromeAgent = false
    safariAgent = false
  }

  if (safariAgent) {
    return 'Safari'
  } else if (chromeAgent) {
    return 'Chrome'
  } else if (IExplorerAgent) {
    return 'Internet Explorer'
  } else if (operaAgent) {
    return 'Opera'
  } else if (firefoxAgent) {
    return 'Firefox'
  } else if (edgeAgent) {
    return 'Edge'
  }

  return 'Other. User agent: ' + userAgentString
} 