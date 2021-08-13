import React, { useState } from 'react'
import { bindActionCreators, Dispatch } from 'redux'
import Drawer from '@material-ui/core/Drawer'
import Container from '@material-ui/core/Container'
import DialogTitle from '@material-ui/core/DialogTitle'
import Paper from '@material-ui/core/Paper'
import InputBase from '@material-ui/core/InputBase'
import FormControl from '@material-ui/core/FormControl'
import Button from '@material-ui/core/Button'
import DialogActions from '@material-ui/core/DialogActions'
import { fetchUsersAsAdmin } from '../../reducers/admin/user/service'
import { selectAdminUserState } from '../../reducers/admin/user/selector'
import Select from '@material-ui/core/Select'
import MenuItem from '@material-ui/core/MenuItem'
import { useStyles } from './styles'
import { connect } from 'react-redux'
import { selectAuthState } from '../../../user/reducers/auth/selector'
import { getGroupService } from '../../reducers/admin/group/service'
import { selectGroupState } from '../../reducers/admin/group/selector'
import { updateScopeService } from '../../reducers/admin/scope/service'
import { formValid } from './validation'

interface Props {
  onCloseEdit: any
  scopeAdmin: any
  fetchUsersAsAdmin?: any
  adminUserState?: any
  authState?: any
  getGroupService?: any
  adminGroupState?: any
  updateScope?: any
}

const mapStateToProps = (state: any): any => {
  return {
    authState: selectAuthState(state),
    adminUserState: selectAdminUserState(state),
    adminGroupState: selectGroupState(state)
  }
}

const mapDispatchToProps = (dispatch: Dispatch): any => ({
  fetchUsersAsAdmin: bindActionCreators(fetchUsersAsAdmin, dispatch),
  getGroupService: bindActionCreators(getGroupService, dispatch),
  updateScope: bindActionCreators(updateScopeService, dispatch)
})

const EditScope = (props: Props) => {
  const { onCloseEdit, scopeAdmin, adminGroupState, adminUserState, authState, fetchUsersAsAdmin, getGroupService, updateScope } = props
  const groups = adminGroupState.get('group').get('group')
  const users = adminUserState.get('users').get('users')
  const user = authState.get('user')
  const id = scopeAdmin.id

  const [state, setState] = useState({
    name: scopeAdmin.scopeName,
    userId: scopeAdmin.user.id,
    groupId: scopeAdmin.group.id,
    location: scopeAdmin.scopeType.location,
    editor: 'write',
    scene: scopeAdmin.scopeType.scene,
    bot: scopeAdmin.scopeType.bot,
    globalAvatars: scopeAdmin.scopeType.globalAvatars,
    static_resource: scopeAdmin.scopeType.static_resource,
    formErrors: {
      name: '',
      userId: '',
      groupId: '',
      location: '',
      editor: '',
      scene: '',
      bot: '',
      globalAvatars: '',
      static_resource: ''
    }
  })

  const classes = useStyles()

  React.useEffect(() => {
    const fetchData = async () => {
      await getGroupService()
      await fetchUsersAsAdmin()
    }
    fetchData()
  }, [user])

  const handleChange = (event) => {
    const { name } = event.target
    const value = event.target.value
    let temp = { ...state.formErrors }

    switch (name) {
      case 'name':
        temp.name = value.length < 2 ? 'Name is required' : ''
        break
      case 'userId':
        temp.userId = value.length < 2 ? 'user is required' : ''
        break
      case 'groupId':
        temp.groupId = value.length < 2 ? 'group is required' : ''
        break
      case 'location':
        temp.location = value.length < 2 ? 'location is required' : ''
        break
      case 'scene':
        temp.scene = value.length < 2 ? 'scene is required' : ''
        break
      case 'globalAvatars':
        temp.globalAvatars = value.length < 2 ? 'globalAvatars is required' : ''
        break
      case 'static_resource':
        temp.static_resource = value.length < 2 ? 'static_resource is required' : ''
        break
      case 'bot':
        temp.bot = value.length < 2 ? 'Bot is required' : ''
        break

      default:
        break
    }

    setState({ ...state, [name]: value, formErrors: temp })
  }

  const handleSubmit = (event) => {
    event.preventDefault()
    const { name, userId, groupId, editor, location, scene, globalAvatars, static_resource, bot } = state
    let temp = state.formErrors

    if (!state.name) {
      temp.name = 'Name is required'
    }
    if (!state.userId) {
      temp.userId = 'User is required'
    }
    if (!state.groupId) {
      temp.groupId = 'Group is required'
    }
    if (!state.location) {
      temp.location = 'Location is required'
    }
    if (!state.scene) {
      temp.scene = 'Scene is required'
    }
    if (!state.static_resource) {
      temp.static_resource = 'Static resource is required'
    }
    if (!state.globalAvatars) {
      temp.globalAvatars = 'Global Avatars is required'
    }
    if (!state.bot) {
      temp.bot = 'Bot is required'
    }

    setState({ ...state, formErrors: temp })

    if (formValid(state, state.formErrors)) {
      updateScope(id, { scopeName: name, userId, groupId, scene, location, globalAvatars, static_resource, editor, bot })
      setState({
        ...state,
        name: '',
        userId: '',
        groupId: '',
        location: '',
        scene: '',
        bot: '',
        globalAvatars: '',
        static_resource: ''
      })
    }
  }

  return (
    <React.Fragment>
      <Container maxWidth="sm" className={classes.marginTop}>
        <form onSubmit={(e) => handleSubmit(e)}>
          <DialogTitle id="form-dialog-title" className={classes.texAlign}>
            Update Scope
          </DialogTitle>
          <label>Name</label>
          <Paper component="div" className={state.formErrors.name.length > 0 ? classes.redBorder : classes.createInput}>
            <InputBase
              className={classes.input}
              name="name"
              placeholder="Enter scope name"
              style={{ color: '#fff' }}
              autoComplete="off"
              value={state.name}
              onChange={handleChange}
            />
          </Paper>
          <label>Group</label>
          <Paper
            component="div"
            className={state.formErrors.groupId.length > 0 ? classes.redBorder : classes.createInput}
          >
            <FormControl fullWidth>
              <Select
                labelId="demo-controlled-open-select-label"
                id="demo-controlled-open-select"
                fullWidth
                name="groupId"
                displayEmpty
                className={classes.select}
                MenuProps={{ classes: { paper: classes.selectPaper } }}
                value={state.groupId}
                onChange={handleChange}
              >
                <MenuItem value="" disabled>
                  <em>Select group</em>
                </MenuItem>
                {groups.map((group) => (
                  <MenuItem value={group.id} key={group.id}>
                    {group.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Paper>
          <label>User</label>
          <Paper
            component="div"
            className={state.formErrors.userId.length > 0 ? classes.redBorder : classes.createInput}
          >
            <FormControl fullWidth>
              <Select
                labelId="demo-controlled-open-select-label"
                id="demo-controlled-open-select"
                fullWidth
                name="userId"
                displayEmpty
                className={classes.select}
                MenuProps={{ classes: { paper: classes.selectPaper } }}
                value={state.userId}
                onChange={handleChange}
              >
                <MenuItem value="" disabled>
                  <em>Select user</em>
                </MenuItem>
                {users.map((user) => (
                  <MenuItem value={user.id} key={user.id}>
                    {user.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Paper>

          <DialogTitle id="form-dialog-title">Grand access</DialogTitle>

          <label>Location</label>
          <Paper
            component="div"
            className={state.formErrors.location.length > 0 ? classes.redBorder : classes.createInput}
          >
            <FormControl fullWidth>
              <Select
                labelId="demo-controlled-open-select-label"
                id="demo-controlled-open-select"
                fullWidth
                name="location"
                displayEmpty
                className={classes.select}
                MenuProps={{ classes: { paper: classes.selectPaper } }}
                value={state.location}
                onChange={handleChange}
              >
                <MenuItem value="" disabled>
                  <em>Select location</em>
                </MenuItem>
                <MenuItem value={'write'}>Write</MenuItem>
                <MenuItem value={'read'}>Read</MenuItem>
              </Select>
            </FormControl>
          </Paper>
          <label>Scene</label>
          <Paper
            component="div"
            className={state.formErrors.scene.length > 0 ? classes.redBorder : classes.createInput}
          >
            <FormControl fullWidth>
              <Select
                labelId="demo-controlled-open-select-label"
                id="demo-controlled-open-select"
                fullWidth
                name="scene"
                displayEmpty
                className={classes.select}
                MenuProps={{ classes: { paper: classes.selectPaper } }}
                value={state.scene}
                onChange={handleChange}
              >
                <MenuItem value="" disabled>
                  <em>Select scene</em>
                </MenuItem>
                <MenuItem value={'write'}>Write</MenuItem>
                <MenuItem value={'read'}>Read</MenuItem>
              </Select>
            </FormControl>
          </Paper>
          <label>static resource</label>
          <Paper
            component="div"
            className={state.formErrors.static_resource.length > 0 ? classes.redBorder : classes.createInput}
          >
            <FormControl fullWidth>
              <Select
                labelId="demo-controlled-open-select-label"
                id="demo-controlled-open-select"
                fullWidth
                name="static_resource"
                displayEmpty
                className={classes.select}
                MenuProps={{ classes: { paper: classes.selectPaper } }}
                value={state.static_resource}
                onChange={handleChange}
              >
                <MenuItem value="" disabled>
                  <em>Select static resource</em>
                </MenuItem>
                <MenuItem value={'write'}>Write</MenuItem>
                <MenuItem value={'read'}>Read</MenuItem>
              </Select>
            </FormControl>
          </Paper>

          <label>Bot</label>
          <Paper component="div" className={state.formErrors.bot.length > 0 ? classes.redBorder : classes.createInput}>
            <FormControl fullWidth>
              <Select
                labelId="demo-controlled-open-select-label"
                id="demo-controlled-open-select"
                fullWidth
                name="bot"
                displayEmpty
                className={classes.select}
                MenuProps={{ classes: { paper: classes.selectPaper } }}
                value={state.bot}
                onChange={handleChange}
              >
                <MenuItem value="" disabled>
                  <em>Select bot</em>
                </MenuItem>
                <MenuItem value={'write'}>Write</MenuItem>
                <MenuItem value={'read'}>Read</MenuItem>
              </Select>
            </FormControl>
          </Paper>
          <label>global Avatars</label>
          <Paper
            component="div"
            className={state.formErrors.globalAvatars.length > 0 ? classes.redBorder : classes.createInput}
          >
            <FormControl fullWidth>
              <Select
                labelId="demo-controlled-open-select-label"
                id="demo-controlled-open-select"
                fullWidth
                name="globalAvatars"
                displayEmpty
                className={classes.select}
                MenuProps={{ classes: { paper: classes.selectPaper } }}
                value={state.globalAvatars}
                onChange={handleChange}
              >
                <MenuItem value="" disabled>
                  <em>Select global avatar</em>
                </MenuItem>
                <MenuItem value={'write'}>Write</MenuItem>
                <MenuItem value={'read'}>Read</MenuItem>
              </Select>
            </FormControl>
          </Paper>
          <DialogActions className={classes.marginTp}>
            <Button type="submit" className={classes.saveBtn}>
              Submit
            </Button>
            <Button
              onClick={() => {
                setState({
                  ...state,
                  name: '',
                  userId: '',
                  groupId: '',
                  location: '',
                  scene: '',
                  bot: '',
                  globalAvatars: '',
                  static_resource: ''
                })
                onCloseEdit()
              }}
              className={classes.saveBtn}
            >
              Cancel
            </Button>
          </DialogActions>
        </form>
      </Container>
    </React.Fragment>
  )
}

export default connect(mapStateToProps, mapDispatchToProps)(EditScope)
