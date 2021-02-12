import React, { PureComponent } from 'react'
import { connect } from 'react-redux'
import CardActions from '@material-ui/core/CardActions'
import CardContent from '@material-ui/core/CardContent'
import Button from '@material-ui/core/Button'
import Typography from '@material-ui/core/Typography'
import FormControl from '@material-ui/core/FormControl'
import FormGroup from '@material-ui/core/FormGroup'
import FormControlLabel from '@material-ui/core/FormControlLabel'
import Checkbox from '@material-ui/core/Checkbox'
import TextField from '@material-ui/core/TextField'
import { withStyles } from '@material-ui/core/styles'
import every from 'lodash/every'
import styled from 'styled-components'
import {
  saveFeedbackInput,
  sendFeedback,
} from './actions/feedbackInput'

const FeedbackInputLabel = styled.div`
  font-size: 14px;
  font-weight: bold;
  padding-bottom: 15px;
  padding-top: 13px;
`

const styles = () => ({
  root: {
  },
  inputMultiline: {
    fontSize: '0.875rem',
    overflowY: 'hidden'
  }
})

class FeedbackInput extends PureComponent<any> {
  state = {
    isSubmitted: false,
    feedbackComment: ''
  }

  render() {
    const {
      feedbackInputs,
      feedbackUrl,
      saveFeedbackInput,
      sendFeedback,
      session,
      outputContexts
    } = this.props

    const handleInputChange = name => event => {
      const inputItem = {
        value: name,
        checked: event.target.checked,
      }
      saveFeedbackInput(inputItem)
    }

    // We need to filter values that are not checked, and return
    // a list of checked values in the final submission
    const processList = list => {
      return list
        .filter(item => {
          return item.checked ? item.value : null
        })
        .map(item => {
          return item.value
        })
    }

    const sendAnalytics = data => {
      fetch(feedbackUrl, {
        method: 'POST',
        body: JSON.stringify(data),
        headers: {
          'Content-Type': 'application/json',
        },
      })
    }

    // On form submit, build the payload data structure,
    // send the payload to analytics, send message to dialogflow,
    // and set submitted flag to true in redux state.
    const handleSubmit = () => {
      const payload = {
        wasHelpful: feedbackInputs.wasHelpful,
        session,
        feedbackList: processList(feedbackInputs.feedbackList),
        comment: this.state.feedbackComment,
        outputContexts
      }

      sendAnalytics(payload)
      sendFeedback('Feedback complete')
      this.setState((prevState) => ({ ...prevState, isSubmitted: true }))
    }

    return (
      <>
        {!this.state.isSubmitted ?
          (
            <div>
              <CardContent>
                <Typography gutterBottom variant='h6'>
                  {feedbackInputs.wasHelpful
                    ? 'Why was Gen helpful?'
                    : 'Why was Gen not helpful?'}
                </Typography>
                <FormControl component={'fieldset' as any}>
                  <FormGroup>
                    {feedbackInputs.feedbackList
                      ? feedbackInputs.feedbackList.map(choice => {
                        return (
                          <FormControlLabel
                            key={choice.value}
                            control={(
                              <Checkbox
                                checked={choice.checked}
                                onChange={handleInputChange(choice.value)}
                                value={choice.value}
                              />
                            )}
                            label={choice.value}
                          />
                        )
                      })
                      : null}
                    <FeedbackInputLabel>Add your comments</FeedbackInputLabel>
                    <TextField
                      placeholder="Type something"
                      variant="outlined"
                      multiline
                      value={this.state.feedbackComment}
                      onChange={e => {
                        // Need to copy the value here because of React's synthetic events
                        const newValue = e.target.value
                        this.setState(prevState => ({ ...prevState, feedbackComment: newValue }))
                      }}
                      InputProps={{
                        classes: {
                          inputMultiline: this.props.classes.inputMultiline
                        },
                      }}
                    />
                  </FormGroup>
                </FormControl>
              </CardContent>
              <CardActions>
                <Button
                  size='small'
                  color='primary'
                  onClick={handleSubmit}
                  disabled={
                    !(
                      (!!feedbackInputs.feedbackList && feedbackInputs.feedbackList.length > 0
                        && !every(feedbackInputs.feedbackList, x => !x.checked))
                      || !!this.state.feedbackComment)
                  }
                >
                  Submit
                </Button>
              </CardActions>
            </div>
          )
          :
          (
            <CardContent>
              Thank you. Your feedback is important to us and will help improve Gen.
            </CardContent>
          )}
      </>
    )
  }
}

const mapStateToProps = state => {
  return {
    feedbackInputs: state.feedbackInput,
    feedbackUrl: state.config.feedbackUrl,
    outputContexts: state.conversation.outputContexts
  }
}

const mapDispatchToProps = dispatch => {
  return {
    saveFeedbackInput: value => {
      dispatch(saveFeedbackInput(value))
    },
    sendFeedback: value => {
      dispatch(sendFeedback(value))
    },
  }
}

export default withStyles(styles as any)(connect(
  mapStateToProps,
  mapDispatchToProps
)(FeedbackInput))
