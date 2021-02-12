import { keyBy, map, reduce, orderBy, mapValues, forEach } from 'lodash'
import { format, differenceInCalendarDays, differenceInCalendarMonths, startOfWeek } from 'date-fns'

const dateAdd = (date, days) => new Date(date.getFullYear(), date.getMonth(), date.getDate() + days)

// This function is meant to be used specifically with
// date strings in the format mm-dd-yyyy (i.e. without time component)
const toDate = (dateString) => {
  const [month, day, year] = dateString.split('-')
  return new Date(year, month, day)
}

// If a day has no data (maybe it was the weekend), then we fill in that data with zeroes.
// NOTE - This will not fill in the specific support requests types with zeroes.
const fillMissingData = (metrics, filterStartDate, filterEndDate) => {
  const metricsByDate = keyBy(metrics, x => x.id)
  const startDate = new Date(filterStartDate)
  const numberOfDaysInFilter = differenceInCalendarDays(new Date(filterEndDate), new Date(filterStartDate)) + 1

  const cleanedData = []

  for (let i = 0; i < numberOfDaysInFilter; i++) {
    const formattedDate = format(dateAdd(startDate, i), 'MM-dd-yyyy')
    if (metricsByDate[formattedDate]) {
      cleanedData.push({
        id: formattedDate,
        numConversations: metricsByDate[formattedDate].numConversations ? metricsByDate[formattedDate].numConversations : 0,
        numConversationsWithDuration: metricsByDate[formattedDate].numConversationsWithDuration ? metricsByDate[formattedDate].numConversationsWithDuration : 0,
        supportRequests: metricsByDate[formattedDate].supportRequests ? metricsByDate[formattedDate].supportRequests : 0,
        cpCount: metricsByDate[formattedDate].cpCount ? metricsByDate[formattedDate].cpCount : 0,
        ncpCount: metricsByDate[formattedDate].ncpCount ? metricsByDate[formattedDate].ncpCount : 0,
        employerCount: metricsByDate[formattedDate].cpCount ? metricsByDate[formattedDate].employerCount : 0,
      })
    } else {
      cleanedData.push({
        id: formattedDate,
        numConversations: 0,
        numConversationsWithDuration: 0,
        cpCount: 0,
        ncpCount: 0,
        employerCount: 0,
        supportRequests: []
      })
    }
  }

  return cleanedData
}

// Not every day has a value for each type of support request. This function will make sure
// every day has a property for each support ticket type, and defaults to zero when necessary.
const sortAndFillSupportRequestBlanks = (data, typesOfSupportRequests) => {
  // Sort by date
  const dataSorted = orderBy(data, x => toDate(x.id).getTime())

  // Create an object that contains all the types of support requests (as keys), and their values are 0
  // We do it this way to keep this logic generic and future proof in case new types of support requests are added
  const defaultSupportValues = mapValues(keyBy([...typesOfSupportRequests], x => x), () => 0)

  // Spread the default support values, and override the defaults with any preexisting. 
  // All months need to have all support request types, even if 0, in order to work in graph. 
  const paddedData = map(dataSorted, x => ({
    ...defaultSupportValues,
    ...x
  }))

  return {
    typesOfSupportRequests: [...typesOfSupportRequests], // Converting from set to array
    data: paddedData
  }
}

const prepareDataForComposedChartByDay = (rawData, filterStartDate, filterEndDate) => {
  const data = fillMissingData(rawData, filterStartDate, filterEndDate)
  const typesOfSupportRequests = new Set()
  const mappedData = map(data, day => ({
    id: day.id,
    label: day.id,
    numConversations: day.numConversations,
    numConversationsWithDuration: day.numConversationsWithDuration,
    // Add each type of support ticket as a piece of data at root level for use by line chart. 
    ...(reduce(day.supportRequests, function (result, supportRequest) {
      // Add to collection of types of support requests
      typesOfSupportRequests.add(supportRequest.name)

      // Add to reducer object
      result[supportRequest.name] = supportRequest.occurrences ? supportRequest.occurrences : 0
      return result
    }, {}))
  }))

  return sortAndFillSupportRequestBlanks(mappedData, typesOfSupportRequests)
}

const prepareDataForComposedChartByAggregationType = (aggregationType, rawData, filterStartDate, filterEndDate) => {
  const data = fillMissingData(rawData, filterStartDate, filterEndDate)

  // We need to know how many different types of support requests were submitted so the line graph can be dynamic and future proof.
  const typesOfSupportRequests = new Set()

  const aggregatedData = reduce(data, function (result, day) {
    let key = ''
    let label = ''

    if (aggregationType === 'monthly') {
      label = `${toDate(day.id).getFullYear()}-${toDate(day.id).getMonth() + 1}`
      key = `${toDate(day.id).getMonth() + 1}-1-${toDate(day.id).getFullYear()}`
    } else if (aggregationType === 'weekly') {
      // If we are display by week, then the x-axis label will be the start of the week.
      const _startOfWeek = startOfWeek(toDate(day.id))

      label = `${_startOfWeek.getMonth() + 1}-${_startOfWeek.getDate()}`
      key = `${_startOfWeek.getMonth() + 1}-${_startOfWeek.getDate()}-${_startOfWeek.getFullYear()}`
    }

    // Create this property (year and month) if it doesn't exist yet
    if (!result[key]) {
      result[key] = {
        id: key,
        label
      }
    }

    const monthNumConversations = result[key].numConversations ? result[key].numConversations : 0
    const dayNumConversations = day.numConversations ? day.numConversations : 0

    const monthNumConversationsWithDuration = result[key].numConversationsWithDuration ? result[key].numConversationsWithDuration : 0
    const dayNumConversationsWithDuration = day.numConversationsWithDuration ? day.numConversationsWithDuration : 0

    // Add the metrics of that day to the overall month/week
    result[key].numConversations = monthNumConversations + dayNumConversations
    result[key].numConversationsWithDuration = monthNumConversationsWithDuration + dayNumConversationsWithDuration

    // Add the support request metrics of that day to the overall month/week
    if (day.supportRequests) {
      day.supportRequests.forEach(x => {
        // Add to collection of types of support requests
        typesOfSupportRequests.add(x.name)

        result[key][x.name] = (result[key][x.name] ? result[key][x.name] : 0) + x.occurrences
      })
    }

    return result
  }, {})

  return sortAndFillSupportRequestBlanks(aggregatedData, typesOfSupportRequests)
}

export const prepareDataForComposedChart = (data, filterLabel, filterStartDate, filterEndDate) => {
  const totalCalendarMonths = differenceInCalendarMonths(new Date(filterEndDate), new Date(filterStartDate)) + 1
  const totalCalendarDays = differenceInCalendarDays(new Date(filterEndDate), new Date(filterStartDate)) + 1

  // If the date filter spans more than 1 month and less than 3, we display data as weeks. 
  // If it spans 3 or more, we display monthly.
  if (totalCalendarMonths === 2 && filterLabel !== 'Last 30 days' && totalCalendarDays > 14) {
    return prepareDataForComposedChartByAggregationType('weekly', data, filterStartDate, filterEndDate)
  } else if (totalCalendarMonths >= 3) {
    return prepareDataForComposedChartByAggregationType('monthly', data, filterStartDate, filterEndDate)
  } else {
    return prepareDataForComposedChartByDay(data, filterStartDate, filterEndDate)
  }
}

export const aggregatePersonaMetricsForPieChart = (dailyMetrics) => {
  const aggregatedData = reduce(dailyMetrics, (result, dayMetrics) => {
    return ({
      Employer: result.Employer + (dayMetrics.employerCount ? dayMetrics.employerCount : 0),
      CP: result.CP + (dayMetrics.cpCount ? dayMetrics.cpCount : 0),
      NCP: result.NCP + (dayMetrics.ncpCount ? dayMetrics.ncpCount : 0)
    })

  }, { Employer: 0, CP: 0, NCP: 0 })

  return map(aggregatedData, (value, key) => ({ name: key, count: value }))
}

export const aggregateBrowserMetricsForPieChart = (dailyMetrics) => {
  const aggregatedData = reduce(dailyMetrics, (result, dayMetrics) => {
    const newResults = { ...result }
    forEach(dayMetrics.userBrowsers, (value, index) => {
      newResults[index] = newResults[index] ? newResults[index] + value : value
    })

    return newResults
  }, {})

  return map(aggregatedData, (value, key) => ({ name: key, count: value }))
}

export const aggregatePlatformMetricsForPieChart = (dailyMetrics) => {
  const aggregatedData = reduce(dailyMetrics, (result, dayMetrics) => {
    return ({
      Mobile: result.Mobile + (dayMetrics.mobileConversations ? dayMetrics.mobileConversations : 0),
      Desktop: result.Desktop + (dayMetrics.nonMobileConversations ? dayMetrics.nonMobileConversations : 0)
    })
  }, { Mobile: 0, Desktop: 0 })

  return map(aggregatedData, (value, key) => ({ name: key, count: value }))
}