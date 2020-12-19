import * as actionTypes from '../actions/actionTypes'

const initialState = {
  // Set Today filter by default
  filterLabel: 'Last 7 days',
  dateFilters: {
    start: null,
    end: null,
  },
  isCustomDateRange: false,
  openDateDialog: false,
  colors: [],
  mainColor: '#8681A6',
  context: '',
  timezoneOffset: -7, // Offset Firebase
}

const reducer = (state = initialState, action) => {
  switch (action.type) {
    case actionTypes.UPDATE_FILTERS:
      return {
        ...state,
        filterLabel: action.filterLabel,
        dateFilters: action.dateFilters,
      }

    case actionTypes.UPDATE_CONTEXT:
      return {
        ...state,
        context: action.context,
        mainColor: action.mainColor,
        colors: action.colors,
        timezoneOffset: action.timezoneOffset,
        dateFilters: action.dateFilters,
      }

    case actionTypes.UPDATE_MAIN_COLOR:
      return {
        ...state,
        mainColor: action.mainColor,
        colors: action.colors,
      }

    case actionTypes.SET_IS_CUSTOM_DATE_RANGE:
      return {
        ...state,
        isCustomDateRange: action.isCustomDateRange,
      }

    case actionTypes.TOGGLE_DATE_DIALOG:
      return {
        ...state,
        openDateDialog: action.shouldOpen,
      }

    default:
      return state
  }
}

export default reducer
