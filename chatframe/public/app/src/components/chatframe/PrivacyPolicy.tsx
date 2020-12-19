import React, { PureComponent } from 'react'
import { connect } from 'react-redux'
import DialogTitle from '@material-ui/core/DialogTitle'
import Dialog from '@material-ui/core/Dialog'
import DialogActions from '@material-ui/core/DialogActions'
import DialogContent from '@material-ui/core/DialogContent'
import DialogContentText from '@material-ui/core/DialogContentText'
import Button from '@material-ui/core/Button'
import styled from 'styled-components'
import { hidePrivacyPolicy } from './actions/initialization'

const StyledDialog = styled(Dialog)`
  && {
    position: absolute;
  }
`

class PrivacyPolicy extends PureComponent<any> {
  render() {
    const {
      hidePrivacyPolicy,
      privacyPolicyVisible,
      privacyPolicy,
      parentRef,
    } = this.props
    return (
      <StyledDialog
        open={privacyPolicyVisible}
        onClose={hidePrivacyPolicy}
        aria-labelledby="privacy-policy"
        container={parentRef}
        scroll="paper"
      >
        <DialogTitle>Privacy Statement</DialogTitle>
        <DialogContent>
          <DialogContentText>{privacyPolicy}</DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={hidePrivacyPolicy} color="primary">
            Close
          </Button>
        </DialogActions>
      </StyledDialog>
    )
  }
}

const mapStateToProps = state => {
  return {
    privacyPolicyVisible: state.config.privacyPolicyVisible,
    privacyPolicy: state.config.privacyPolicy,
  }
}

const mapDispatchToProps = {
  hidePrivacyPolicy,
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(PrivacyPolicy)
