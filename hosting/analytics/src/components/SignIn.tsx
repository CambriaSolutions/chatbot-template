import React, { useState } from 'react'
import styled from 'styled-components'
import Avatar from '@material-ui/core/Avatar'
import Button from '@material-ui/core/Button'
import TextField from '@material-ui/core/TextField'
import InsertChartOutlined from '@material-ui/icons/InsertChartOutlined'
import Paper from '@material-ui/core/Paper'
import Typography from '@material-ui/core/Typography'
import CircularProgress from '@material-ui/core/CircularProgress'
import { connect } from 'react-redux'
import { Redirect } from 'react-router'
import { signIn } from '../store/actions'

const OuterContainer = styled.div`
  width: auto;
  margin-left: 24px;
  margin-right: 24px;
  display: block;
  @media (min-width: 448px) {
    width: 400px;
    margin-left: auto;
    margin-right: auto;
  }
`

const InnerContainer = styled(Paper)`
  margin-top: 64px;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 16px 24px 24px;
`

const IconContainer = styled(Avatar)`
  margin: 8px;
  && {
    background: #387eb5;
  }
`

const FormContainer = styled.form`
  width: 100%;
  margin-top: 8px;
`

const SubmitButton = styled(Button)`
  && {
    margin-top: 24px;
  }
`
const Spinner = styled(CircularProgress)`
  && {
    color: #fff;
  }
`

function SignIn(props) {
  const { signIn, isLoggedIn, isLoading, isAuthenticating } = props
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const { from } = props.location.state || { from: { pathname: '/' } }

  const handleFormSubmit = e => {
    e.preventDefault()
    if (!isLoggedIn) {
      signIn(username.toLowerCase(), password)
    }
  }
  
  if (isLoggedIn && !isAuthenticating && !isLoading) {
    return <Redirect to={from} />
  } 
  else if ((!isLoading && !isLoggedIn) || isAuthenticating){
    return (
      <OuterContainer>
        <InnerContainer>
          <IconContainer>
            <InsertChartOutlined />
          </IconContainer>
          <Typography component='h1' variant='h5'>
            Analytics Sign In
          </Typography>
          <FormContainer>
            <TextField
              label='Email'
              margin='normal'
              fullWidth
              required
              onChange={e => setUsername(e.target.value)}
              id='username_input'
            />
            <TextField
              label='Password'
              margin='normal'
              fullWidth
              required
              type='password'
              onChange={e => setPassword(e.target.value)}
              autoComplete='current-password'
              id='pwd_input'
            />
            <SubmitButton
              type='submit'
              fullWidth
              variant='contained'
              color='primary'
              onClick={handleFormSubmit}
            >
              {isAuthenticating ? <Spinner size={24} /> : 'Sign In'}
            </SubmitButton>
          </FormContainer>
        </InnerContainer>
      </OuterContainer>
    )
  }
  else {
    return null
  }
}

const mapStateToProps = state => {
  return {
    isLoggedIn: state.auth.isLoggedIn,
    isLoading: state.auth.isLoading,
    isAuthenticating: state.auth.isAuthenticating
  }
}

export default connect(
  mapStateToProps,
  { signIn }
)(SignIn)
