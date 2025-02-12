import React, { useState, useEffect } from 'react'
import Button from '@material-ui/core/Button'
import TextField from '@material-ui/core/TextField'
import Typography from '@material-ui/core/Typography'
import Container from '@material-ui/core/Container'
import { connect } from 'react-redux'
import { bindActionCreators, Dispatch } from 'redux'
import Grid from '@material-ui/core/Grid'
import FormControlLabel from '@material-ui/core/FormControlLabel'
import Checkbox from '@material-ui/core/Checkbox'
import { Link } from 'react-router-dom'
import { Config } from '../../../helper'
import styles from './Auth.module.scss'
import { User } from '@xrengine/common/src/interfaces/User'
import { createMagicLink, addConnectionBySms, addConnectionByEmail } from '../../reducers/auth/service'
import { selectAuthState } from '../../reducers/auth/selector'
import { useTranslation } from 'react-i18next'

interface Props {
  auth?: any
  type?: 'email' | 'sms' | undefined
  isAddConnection?: boolean
  createMagicLink?: typeof createMagicLink
  addConnectionBySms?: typeof addConnectionBySms
  addConnectionByEmail?: typeof addConnectionByEmail
}

const mapStateToProps = (state: any): any => {
  return {
    auth: selectAuthState(state)
  }
}

const mapDispatchToProps = (dispatch: Dispatch): any => ({
  createMagicLink: bindActionCreators(createMagicLink, dispatch),
  addConnectionBySms: bindActionCreators(addConnectionBySms, dispatch),
  addConnectionByEmail: bindActionCreators(addConnectionByEmail, dispatch)
})

const defaultState = {
  emailPhone: '',
  isSubmitted: false,
  isAgreedTermsOfService: false,
  label: '',
  descr: ''
}

const termsOfService = Config.publicRuntimeConfig.staticPages?.termsOfService ?? '/terms-of-service'

const MagicLinkEmail = (props: Props): any => {
  const { auth, type, isAddConnection, createMagicLink, addConnectionBySms, addConnectionByEmail } = props
  const [state, setState] = useState(defaultState)
  const { t } = useTranslation()

  const handleInput = (e: any): any => {
    setState({ ...state, [e.target.name]: e.target.value })
  }

  const handleCheck = (e: any): any => {
    setState({ ...state, [e.target.name]: e.target.checked })
  }

  const handleSubmit = (e: any): any => {
    e.preventDefault()
    if (!isAddConnection) {
      createMagicLink(state.emailPhone)
      setState({ ...state, isSubmitted: true })
      return
    }

    const user = auth.get('user') as User
    const userId = user ? user.id : ''
    if (type === 'email') {
      addConnectionByEmail(state.emailPhone, userId)
    } else {
      addConnectionBySms(state.emailPhone, userId)
    }
  }
  let descr = ''
  let label = ''

  useEffect(() => {
    // Pass in a type
    if (type === 'email') {
      descr = t('user:auth.magiklink.descriptionEmail')
      label = t('user:auth.magiklink.lbl-email')
      return
    } else if (type === 'sms') {
      descr = t('user:auth.magiklink.descriptionSMS')
      label = t('user:auth.magiklink.lbl-phone')
      return
    } else if (!Config.publicRuntimeConfig.auth) {
      descr = t('user:auth.magiklink.descriptionEmail')
      label = t('user:auth.magiklink.lbl-email')
      return
    }
    // Auth config is using Sms and Email, so handle both
    if (
      Config.publicRuntimeConfig.auth.enableSmsMagicLink &&
      Config.publicRuntimeConfig.auth.enableEmailMagicLink &&
      !type
    ) {
      descr = t('user:auth.magiklink.descriptionEmailSMS')
      label = t('user:auth.magiklink.lbl-emailPhone')
    } else if (Config.publicRuntimeConfig.auth.enableSmsMagicLink) {
      descr = t('user:auth.magiklink.descriptionSMSUS')
      label = t('user:auth.magiklink.lbl-phone')
    } else {
      descr = t('user:auth.magiklink.descriptionEmail')
      label = t('user:auth.magiklink.lbl-email')
    }

    setState({ ...state, label: label, descr: descr })
  }, [])

  return (
    <Container component="main" maxWidth="xs">
      <div>
        <Typography component="h1" variant="h5">
          {t('user:auth.magiklink.header')}
        </Typography>

        <Typography variant="body2" color="textSecondary" align="center">
          {state.descr}
        </Typography>

        <form className={styles.form} noValidate onSubmit={(e) => handleSubmit(e)}>
          <Grid container>
            <Grid item xs={12}>
              <TextField
                variant="outlined"
                margin="normal"
                required
                fullWidth
                id="emailPhone"
                label={state.label}
                name="emailPhone"
                // autoComplete="email"
                autoFocus
                onChange={(e) => handleInput(e)}
              />
            </Grid>
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Checkbox
                    value={true}
                    onChange={(e) => handleCheck(e)}
                    color="primary"
                    name="isAgreedTermsOfService"
                  />
                }
                label={
                  <div className={styles.termsLink}>
                    {t('user:auth.magiklink.agree')}
                    <Link to={termsOfService}>{t('user:auth.magiklink.terms')}</Link>
                  </div>
                }
              />
            </Grid>
            <Grid item xs={12}>
              <Button
                type="submit"
                fullWidth
                variant="contained"
                color="primary"
                className={styles.submit}
                disabled={!state.isAgreedTermsOfService}
              >
                {t('user:auth.magiklink.lbl-submit')}
              </Button>
            </Grid>
          </Grid>
        </form>
      </div>
    </Container>
  )
}

const MagicLinkEmailWrapper = (props: Props): any => <MagicLinkEmail {...props} />

export default connect(mapStateToProps, mapDispatchToProps)(MagicLinkEmailWrapper)
