import React, { Component } from 'react'
import { connect } from 'react-redux'
import * as actions from '../store/actions/index'
import styled from 'styled-components'
import { withStyles } from '@material-ui/core/styles'
import { reduce } from 'lodash'
import Settings from './Settings'

// Material UI
import Grid from '@material-ui/core/Grid'
import Paper from '@material-ui/core/Paper'
import Icon from '@material-ui/core/Icon'
import Drawer from '@material-ui/core/Drawer'
import Dialog from '@material-ui/core/Dialog'
import ToggleButton from '@material-ui/lab/ToggleButton'
import ToggleButtonGroup from '@material-ui/lab/ToggleButtonGroup'
import HelpOutlineIcon from '@material-ui/icons/HelpOutline'
import Tooltip from '@material-ui/core/Tooltip'
import Zoom from '@material-ui/core/Zoom'

// Components
import Card from '../components/Card'
import PieChart from '../components/PieChart'
import BarChart from '../components/BarChart'
import RadarChart from '../components/RadarChart'
import EnhancedTable from '../components/EnhancedTable'
import UnhandledPhrasesTable from '../components/UnhandledPhrasesTable'
import IntentDetails from '../components/IntentDetails'
import CircularProgress from '@material-ui/core/CircularProgress'

import EngagedUserChart from '../components/EngagedUserChart'

// Helpers
import { colorShades } from '../common/helper'
import {
  aggregatePlatformMetricsForPieChart,
  aggregateBrowserMetricsForPieChart
} from '../scripts/metricUtil'
import db from '../Firebase'

import { showIntentDetails } from '../store/actions/configActions'
import { renameIntent } from '../common/renameIntent'

const getNameFromContext = (context: any) => (/[^/]*$/.exec(context) as any)[0]

const rootStyles = {
  flexGrow: 1,
  margin: '2.5% 3%',
}

const GraphWrap = styled(Paper)`
  padding: 15px;
  position: relative;
  background-color: rgb(250, 250, 250) !important;
  height: 93%;
  h3 {
    margin-top: 5px;
  }
`
const FeedbackButtonGroup = styled(ToggleButtonGroup)`
  position: absolute;
  top: 15px;
  right: 15px;
`

class Dashboard extends Component<any, any> {
  constructor(props: any) {
    super(props)
  }

  feedbackTypeChange = (event: any, feedbackSelected: any) =>
    this.props.onFeedbackChange(feedbackSelected)

  render() {
    console.log('-- Dashboard render')
    const FeedbackTotalsDiv = styled.div`
      position: absolute;
      bottom: 15px;
      right: 15px;
      color: #666;

      .material-icons {
        margin-bottom: -2px;
        font-size: 16px !important;
        color: ${this.props.mainColor};
        opacity: 0.7;
      }
    `

    const StyledToggleButton = withStyles(() => ({
      selected: {
        color: `${this.props.mainColor} !important`,
        backgroundColor: 'rgba(0,0,0,0.05) !important',
      },
    }))(ToggleButton)

    const CenterDiv = styled.div`
      text-align: center;
      position: absolute;
      left: 0;
      right: 0;
      top: 0;
      bottom: 0;
      margin: auto;
      width: 300px;
      height: 300px;
      max-width: 100%;
      max-height: 100%;
      overflow: auto;
      .material-icons {
        font-size: 65px;
        color: ${this.props.mainColor};
      }
    `

    let dashboardUI = (
      <CenterDiv>
        <h2>Loading Metrics...</h2>
        <CircularProgress />
      </CenterDiv>
    )

    if (!this.props.loadingConversations) {
      if (this.props.conversationsTotal > 0) {
        // Remove welcome intent from frequent intents list & exit intents
        const frequentIntents = this.props.intents
          .filter((i: any) => i.name !== 'Default Welcome Intent')
          .slice(0, 5)

        let welcomeExitIntent = this.props.exitIntents.filter(
          (i: any) => i.name === 'Default Welcome Intent'
        )[0]

        if (!welcomeExitIntent) welcomeExitIntent = { exits: 0 }

        const exitIntents = this.props.exitIntents
          .filter((i: any) => i.name !== 'Default Welcome Intent')
          .slice(0, 5)

        dashboardUI = (
          <Grid container spacing={2} >
            <Grid container spacing={2} >
              <Grid item xs={12} sm >
                <Card
                  color={colorShades(this.props.mainColor, 50)}
                  value={this.props.conversationsTotal}
                  label='Total Users'
                  notes=''
                  icon='account_circle'
                  tooltip={
                    this.props.subjectMatterName.toLowerCase() === 'general'
                      ? 'Counts the total number of times when a user acknowledges the privacy statement and enters <<Bot>>\'s home screen.'
                      : (this.props.subjectMatterName.toLowerCase() === 'total'
                        ? 'Counts the total number of impressions when a user click on <<Bot>> on the MDHS website'
                        : `Counts the number of impressions when a user selects the ${this.props.subjectMatterName.toUpperCase()} option from the home screen.`)
                  }
                />
              </Grid>
              {
                this.props.subjectMatterName.toLowerCase() !== 'total' &&
                <Grid item xs={12} sm >
                  <Card
                    color={colorShades(this.props.mainColor, 30)}
                    value={this.props.avgEngagedDuration}
                    label='Avg. Conv Duration'
                    notes=''
                    icon='schedule'
                    tooltip={
                      this.props.subjectMatterName === 'general'
                        ? 'The average time between <<Bot>>\'s first response and when a user selects a knowledge area.'
                        : `The average time of each session for the ${this.props.subjectMatterName.toUpperCase()} knowledge area. A session is the time b/w when a user selects the ${this.props.subjectMatterName.toUpperCase()} option from home screen and the last response that <<Bot>> gives them. This does not include the time b/w the last response and closing their browser window or <<Bot>>.`
                    }
                  />
                </Grid>
              }
              <Grid item xs={12} sm >
                <Card
                  color={colorShades(this.props.mainColor, 10)}
                  value={this.props.subjectMatterName === 'general' ? 'N/A' : `${this.props.conversationsDurationTotal}`}
                  label='Engaged Users'
                  notes={
                    this.props.subjectMatterName === 'general' ? '' : (`${this.props.conversationsTotal -
                      this.props.conversationsDurationTotal} immediate exits`)
                  }
                  icon='speaker_notes'
                  tooltip={
                    this.props.subjectMatterName.toLowerCase() === 'general'
                      ? `This metric is not applicable to the ${this.props.subjectMatterName.toUpperCase()} knowledge area.`
                      : (this.props.subjectMatterName.toLowerCase() === 'total'
                        ? 'Counts the total number of times when a user acknowledges the privacy statement.'
                        : `Counts the number of times a user interacted with <<Bot>> in the ${this.props.subjectMatterName.toUpperCase()} knowledge area`)
                  }
                />
              </Grid>
            </Grid>
            <Grid item xs={12} sm={6} >
              <GraphWrap>
                <Tooltip
                  TransitionComponent={Zoom}
                  title={
                    this.props.subjectMatterName.toLowerCase() === 'total'
                      ? 'Counts the total number of times when a user acknowledges the privacy statement.'
                      : `The number of engaged users who selected the [${this.props.subjectMatterName}] subject matter over time.`
                  }
                  arrow
                  placement='top-start' >
                  <HelpOutlineIcon />
                </Tooltip>
                <EngagedUserChart colors={this.props.colors} />
              </GraphWrap>
            </Grid>
            <Grid item xs={12} sm={6} >
              <GraphWrap>
                <Tooltip
                  TransitionComponent={Zoom}
                  title={
                    this.props.subjectMatterName.toLowerCase() === 'total'
                      ? 'Intents being triggered the most number of times in <<Bot>>'
                      : `Intents being triggered the most number of times for the [${this.props.subjectMatterName}] subject matter`
                  }
                  arrow
                  placement='top-start' >
                  <HelpOutlineIcon />
                </Tooltip>
                <h3 > Frequently used intents </h3>
                <PieChart
                  data={frequentIntents}
                  dataKey='occurrences'
                  colors={this.props.colors}
                />
              </GraphWrap>
            </Grid>
            {
              this.props.subjectMatterName.toLowerCase() !== 'total' &&
              <Grid item xs={12} sm={6} >
                <GraphWrap>
                  <Tooltip TransitionComponent={Zoom} title={`Intents specific to the [${this.props.subjectMatterName}] subject matter after which users exit <<Bot>>`
                  } arrow placement='top-start' >
                    <HelpOutlineIcon />
                  </Tooltip>
                  <h3 > Top exit intents on conversations </h3>
                  <BarChart
                    data={exitIntents}
                    dataKey='exits'
                    colors={this.props.colors}
                    emptyMsg='No exit intents found'
                  />
                </GraphWrap>
              </Grid>
            }
            <Grid item xs={12} sm={6} >
              <GraphWrap>
                <h3>Feedback </h3>
                <FeedbackButtonGroup
                  value={this.props.feedbackSelected}
                  exclusive
                  onChange={this.feedbackTypeChange}
                >
                  <StyledToggleButton value='positive' >
                    <Icon>thumb_up </Icon>
                  </StyledToggleButton>
                  <StyledToggleButton value='negative' >
                    <Icon>thumb_down </Icon>
                  </StyledToggleButton>
                </FeedbackButtonGroup>
                <RadarChart
                  data={this.props.feedback.details}
                  total={this.props.feedback.total}
                  dataKey='occurrences'
                  color={this.props.mainColor}
                />
                <FeedbackTotalsDiv>
                  <b>
                    <Icon>
                      {
                        this.props.feedbackSelected === 'positive'
                          ? 'thumb_up'
                          : 'thumb_down'
                      }
                    </Icon>{' '}
                    Entries: {' '}
                  </b>{' '}
                  {this.props.feedback.total}
                </FeedbackTotalsDiv>
              </GraphWrap>
            </Grid>
            <Grid item xs={12} sm={6} >
              <GraphWrap>
                <h3>Device Distribution </h3>
                <PieChart
                  data={aggregatePlatformMetricsForPieChart(this.props.dailyMetrics)}
                  dataKey='count'
                  colors={this.props.colors}
                />
              </GraphWrap>
            </Grid>
            <Grid item xs={12} sm={6} >
              <GraphWrap>
                <h3>Browser Distribution </h3>
                <PieChart
                  data={aggregateBrowserMetricsForPieChart(this.props.dailyMetrics)}
                  dataKey='count'
                  colors={this.props.colors}
                />
              </GraphWrap>
            </Grid>
            <Grid item xs={12} >
              <EnhancedTable
                data={this.props.intents}
                selectedSubjectMatter={this.props.subjectMatterName}
              />
            </Grid>
            {
              this.props.subjectMatterName.toLowerCase() !== 'total' && this.props.subjectMatterName.toLowerCase() !== 'general' &&
              <Grid item xs={12} >
                <UnhandledPhrasesTable
                  data={this.props.fallbackTriggeringQueries}
                  selectedSubjectMatter={this.props.subjectMatterName}
                />
              </Grid>
            }
          </Grid >
        )
      } else {
        dashboardUI = (
          <CenterDiv>
            <Icon>speaker_notes_off </Icon>
            <h2 > No conversations found </h2>
            <p > Try changing the filter </p>
          </CenterDiv>
        )
      }
    }
    return (
      <div style={rootStyles} >
        <Drawer
          anchor='right'
          open={this.props.showSettings}
          onClose={this.props.onSettingsToggle} >
          <Settings />
        </Drawer>
        {dashboardUI}
        <Dialog
          open={this.props.showIntentModal}
          onClose={this.props.onIntentsModalClose}
          maxWidth={'md'}
          fullWidth={true}
          aria-labelledby='intent_details_title' >
          <IntentDetails
            loading={this.props.loadingIntentDetails}
            totalIntentDetailsCount={this.props.totalIntentDetailsCount}
            data={this.props.intentDetails}
            color={this.props.mainColor}
            timezoneOffset={this.props.timezoneOffset}
            previousPage={() => this.props.onIntentDetailsPreviousPage(this.props.intentDetailsIntent, this.props.intentDetailsPaginationPage - 1)
            }
            nextPage={() => this.props.onIntentDetailsNextPage(this.props.intentDetailsIntent, this.props.intentDetailsPaginationPage + 1)
            }
            paginationPage={this.props.intentDetailsPaginationPage}
          />
        </Dialog>
      </div >
    )
  }
}

const beautifyTime = (seconds: any) => {
  if (seconds > 3600) return `${(seconds / 3600).toFixed(1)} hours`
  else if (seconds > 60) return `${(seconds / 60).toFixed(1)} mins`
  else return `${seconds.toFixed(1)} secs`
}

const beautifyIntents = (subjectMatter: any, intents: any) => {
  return intents.map((intent: any) => {
    // Replace dashes with spaces & capitalize 1st letter
    // The logic runs at a weird time. This will be called once with the display name empty,
    // then again when the displayName has a value.
    let newName = subjectMatter.toLowerCase() === 'total' ?
      (intent.displayName ? intent.displayName : intent.name)
      : renameIntent(intent.name)
    newName = newName.replace(/-/g, ' ')
    newName = newName.charAt(0).toUpperCase() + newName.slice(1)
    return {
      ...intent,
      name: newName,
    }
  })
}

const compareValues = (key: any, order = 'asc') => {
  return (a: any, b: any) => {
    if (!a[key] || !b[key]) {
      return 0
    }

    const varA = typeof a[key] === 'string' ? a[key].toUpperCase() : a[key]
    const varB = typeof b[key] === 'string' ? b[key].toUpperCase() : b[key]

    let comparison = 0
    if (varA > varB) {
      comparison = 1
    } else if (varA < varB) {
      comparison = -1
    }
    return order === 'desc' ? comparison * -1 : comparison
  }
}

const round = (value: any, precision: any) => {
  const multiplier = Math.pow(10, precision || 0)
  return Math.round(value * multiplier) / multiplier
}

const mapStateToProps = (state: any) => {
  const subjectMatter = getNameFromContext(state.filters.context)
  let allIntents = beautifyIntents(subjectMatter, state.metrics.intents)
  const allExitIntents = beautifyIntents(subjectMatter, state.metrics.exitIntents)

  // Sort arrays by exits & occurrences
  allExitIntents.sort(compareValues('exits', 'desc'))

  if (!state.metrics.loading) {
    // Merge exit intents with intents array
    allIntents = allIntents.map((intent: any) =>
      Object.assign(
        {},
        intent,
        allExitIntents.find((conv: any) => conv.id === intent.id) || {
          exits: 0,
        }
      )
    )
    // Sort array by occurrences
    allIntents.sort(compareValues('occurrences', 'desc'))
  }

  return {
    dailyMetrics: state.metrics.dailyMetrics,
    loadingConversations: state.metrics.loading,
    loadingIntents: state.metrics.loading,
    loadingIntentDetails: state.config.loadingIntentDetails,
    conversationsTotal: state.metrics.conversationsTotal,
    avgDuration: beautifyTime(state.metrics.durationTotal),
    avgEngagedDuration: beautifyTime(state.metrics.durationTotalNoExit),
    exitIntents: allExitIntents,
    intents: allIntents,
    fallbackTriggeringQueries: state.metrics.fallbackTriggeringQueries,
    feedbackSelected: state.metrics.feedbackSelected,
    conversationsDurationTotal: state.metrics.conversationsDurationTotal,
    feedback: state.metrics.feedbackFiltered,
    colors: state.filters.colors,
    mainColor: state.filters.mainColor,
    showSettings: state.config.showSettings,
    showIntentModal: state.config.showIntentModal,
    intentDetailsIntent: state.config.intentDetailsIntent,
    intentDetails: state.config.intentDetails,
    intentDetailsPaginationPage: state.config.intentDetailsPaginationPage,
    totalIntentDetailsCount: state.config.totalIntentDetailsCount,
    timezoneOffset: state.filters.timezoneOffset,
    subjectMatterName: subjectMatter
  }
}

const mapDispatchToProps = (dispatch: any) => {
  return {
    onFeedbackChange: (feedbackType: any) =>
      dispatch(actions.updateFeedbackType(feedbackType)),
    onSettingsToggle: () => dispatch(actions.toggleSettings(false)),
    onIntentsModalClose: () => dispatch(actions.toggleIntentsModal(false)),
    onIntentDetailsPreviousPage: (intentDetailsIntent: any, intentDetailsPaginationPage: any) => dispatch(showIntentDetails(intentDetailsIntent, 'previous', intentDetailsPaginationPage)),
    onIntentDetailsNextPage: (intentDetailsIntent: any, intentDetailsPaginationPage: any) => dispatch(showIntentDetails(intentDetailsIntent, 'next', intentDetailsPaginationPage))
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Dashboard)
