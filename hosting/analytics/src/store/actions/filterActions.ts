import * as actionTypes from './actionTypes'
import { fetchMetrics, fetchMetricsTotal } from './metricActions'
import { updateSubjectMatterColor } from './configActions'
import { clearSubscriptions } from './realtimeActions'
import randomColor from 'randomcolor'
import {
  format,
  startOfDay,
  endOfDay,
  subDays,
  subMonths,
  startOfQuarter,
  startOfMonth,
  isSameDay,
} from 'date-fns'
import { getUTCDate } from '../../common/helper'

// Regex to retrieve text after last "/" on a context
const getSubjectMatterFromContext = context => /[^/]*$/.exec(context)[0]

const formatDate = (date, timezoneOffset = null) => {
  if (timezoneOffset) {
    const offset =
      (timezoneOffset >= 0 ? '+' : '-') +
      ('0' + Math.abs(timezoneOffset)).slice(-2)
    return format(date, `yyyy-MM-dd'T'HH:mm:ss.SSS'${offset}:00'`)
  } else return format(date, 'yyyy-MM-dd\'T\'HH:mm:ss.SSSXXX')
}

const getDateRange = (date, timezoneOffset = null) => {
  const startOfToday = formatDate(startOfDay(date), timezoneOffset)
  const endOfToday = formatDate(endOfDay(date), timezoneOffset)
  return { start: startOfToday, end: endOfToday }
}

const getLastQuarter = today => {
  const startOfCurrentQuarter = startOfQuarter(today)
  const lastDayOfLastQuarter = subDays(startOfCurrentQuarter, 1)
  const firstDayOfLastQuarter = startOfQuarter(lastDayOfLastQuarter)
  return {
    start: formatDate(startOfDay(firstDayOfLastQuarter)),
    end: formatDate(endOfDay(lastDayOfLastQuarter)),
  }
}

// Set date range based on filter selected
const getDateFilters = (newFilter, timezoneOffset = -7) => {
  let dateRange = {}
  const today = getUTCDate((new Date() as any), timezoneOffset)

  switch (newFilter) {
    case 'Yesterday':
      dateRange = getDateRange(subDays(today, 1), timezoneOffset)
      break
    case 'Last 7 days':
      dateRange = {
        start: formatDate(startOfDay(subDays(today, 7)), timezoneOffset),
        end: formatDate(endOfDay(subDays(today, 1)), timezoneOffset),
      }
      break
    case 'Last 30 days':
      dateRange = {
        start: formatDate(startOfDay(subDays(today, 30)), timezoneOffset),
        end: formatDate(endOfDay(subDays(today, 1)), timezoneOffset),
      }
      break
    case 'Last 90 days':
      dateRange = {
        start: formatDate(startOfDay(subDays(today, 90)), timezoneOffset),
        end: formatDate(endOfDay(subDays(today, 1)), timezoneOffset),
      }
      break
    case 'Last quarter':
      dateRange = getLastQuarter(today)
      break
    case 'Last 12 months':
      dateRange = {
        start: formatDate(startOfMonth(subMonths(today, 12)), timezoneOffset),
        end: formatDate(subDays(startOfMonth(today), 1), timezoneOffset),
      }
      break

    case 'Today':
    default:
      dateRange = getDateRange(today, timezoneOffset)
  }

  return dateRange
}

export const updateFilters = (event) => {
  return (dispatch, getState) => {
    const offset = getState().filters.timezoneOffset

    // If the selected filter doesn't require a date picker,
    // format the date filter and dispatch data retrieval actions
    if (event.target.value.toLowerCase() !== 'custom') {
      const dateFilters = getDateFilters(event.target.value, offset)

      dispatch(clearSubscriptions())

      const subjectMatter = getSubjectMatterFromContext(getState().filters.context)

      if (subjectMatter.toLowerCase() === 'total') {
        dispatch(fetchMetricsTotal(dateFilters))
      } else {
        dispatch(fetchMetrics(dateFilters))
      }

      dispatch({
        type: actionTypes.UPDATE_FILTERS,
        filterLabel: event.target.value,
        dateFilters: dateFilters,
      })

      dispatch(setIsCustomDateRange(false))
    } else {
      // The user has specified that they would like to select a custom
      // date range, so we enable the to and from date pickers
      dispatch(setIsCustomDateRange(true))
      dispatch(toggleDateDialog(true))
    }
  }
}

export const updateFiltersWithRange = (startDate, endDate) => {
  return (dispatch, getState) => {
    const offset = getState().filters.timezoneOffset

    // Check to see if the user has selected the same day
    let selectedDateFilters
    if (isSameDay(startDate, endDate)) {
      // The user has selected the same day, get the date range
      // based on the startDate selected
      selectedDateFilters = getDateRange(startDate, offset)
    } else {
      // Format the days based on offset
      const utcStart = getUTCDate(startDate, offset)
      const utcEnd = getUTCDate(endDate, offset)

      // Set the new date filters base on start and end of days
      selectedDateFilters = {
        start: formatDate(startOfDay(utcStart), offset),
        end: formatDate(endOfDay(utcEnd), offset),
      }
    }

    const subjectMatter = getSubjectMatterFromContext(getState().filters.context)

    // Fetch the data based on the range
    if (subjectMatter.toLowerCase() === 'total') {
      dispatch(fetchMetricsTotal(selectedDateFilters))
    } else {
      dispatch(fetchMetrics(selectedDateFilters))
    }

    // Update the filters
    dispatch({
      type: actionTypes.UPDATE_FILTERS,
      filterLabel: 'Custom',
      dateFilters: selectedDateFilters,
    })
    dispatch(setIsCustomDateRange(true))
  }
}

export const setIsCustomDateRange = (isCustomDateRange = false) => {
  return dispatch => {
    dispatch({
      type: actionTypes.SET_IS_CUSTOM_DATE_RANGE,
      isCustomDateRange,
    })
  }
}

export const toggleDateDialog = shouldOpen => {
  return dispatch => {
    dispatch({
      type: actionTypes.TOGGLE_DATE_DIALOG,
      shouldOpen,
    })
  }
}

export const updateMainColor = (newColor, updateDB = false) => {
  return (dispatch) => {
    const COLORS = randomColor({
      count: 10,
      hue: newColor,
    })

    dispatch({
      type: actionTypes.UPDATE_MAIN_COLOR,
      mainColor: newColor,
      colors: COLORS,
    })
    if (updateDB) {
      dispatch(updateSubjectMatterColor(newColor))
    }
  }
}

// Change subjectMatter/context and retrieve new metrics & conversations
export const updateSubjectMatter = (subjectMatter, subjectMattersSettings = []) => {
  return (dispatch, getState) => {

    dispatch(clearSubscriptions())

    const context = `subjectMatters/${subjectMatter}`

    // Get subjectMatter's settings based on the given context
    if (subjectMattersSettings.length === 0) {
      subjectMattersSettings = getState().config.subjectMattersSettings
    }

    const currSubjectMatter = subjectMattersSettings.filter(p => p.name === subjectMatter)[0]

    if (currSubjectMatter) {
      const stateDateFilters = getState().filters.dateFilters

      const dateFilters = stateDateFilters.start ? stateDateFilters : getDateFilters(
        getState().filters.filterLabel,
        currSubjectMatter.timezone.offset
      )

      if (currSubjectMatter.name.toLowerCase() === 'total') {
        dispatch(fetchMetricsTotal(dateFilters))
      } else {
        dispatch(fetchMetrics(dateFilters, context))
      }

      const COLORS = randomColor({
        count: 10,
        hue: currSubjectMatter.primaryColor,
      })

      dispatch({
        type: actionTypes.UPDATE_CONTEXT,
        context: context,
        mainColor: currSubjectMatter.primaryColor,
        colors: COLORS,
        timezoneOffset: currSubjectMatter.timezone.offset,
        dateFilters: dateFilters,
      })
    } else {
      dispatch({
        type: actionTypes.UPDATE_CONTEXT,
        context: context,
        mainColor: '',
        colors: [],
        timezoneOffset: -7,
        dateFilters: getState().filters.dateFilters,
      })
    }
  }
}
