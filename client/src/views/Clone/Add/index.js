import React, { Component } from 'react'
import { graphql, compose, Query } from 'react-apollo'
import { clones, teams } from '../../../GraphQL/Calls'
import { DateTime } from 'luxon';

import TopBar from '../../BannerTopBar'

import { withStyles } from '@material-ui/core/styles'
import classNames from 'classnames'
import styles from './styles'

import { types} from '../../../GraphQL/models'
import { isDefined } from '../../../utils'

import {
   MenuItem, Button, TextField, FormControl, InputLabel, Input, Typography,
   Paper, Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions,
   Select, FormControlLabel, Checkbox
} from '@material-ui/core'

import { DateTimePicker } from 'material-ui-pickers';
import {
  ChevronLeft,
  ChevronRight,
} from '@material-ui/icons';

class AddClone extends Component {

  constructor(props){
    super(props)
    let user = localStorage.getItem('user')
    this.state = {
      user: JSON.parse(user),
      teamId:'',
      botId:'',
      mode:'',
      resumeExecution: false,
      beginDatetime: DateTime.local().minus({ days: 8 }).startOf('day'),
      endDatetime: DateTime.local(),
      waitTime: 1,
      state : '',
      stateDatetime: 0,
      createDatetime: 0,
      runAsTeam: false,

      //Error handlers
      nameError: false,
      teamError: false,
      botError: false,
      modeError: false,
      isNewCloneConfirmationOpen: false,
      serverResponse:'',
      serverError: false
    }
  }

  render() {
    const { classes } = this.props
    if( !isDefined(this.state.user) ) {
      return (
        <TopBar
          size='big'
          title='Create a bot clone'
          text="Please login to create a bot clone."
          backgroundUrl='https://advancedalgos.net/img/photos/ecosystem.jpg'
        />
      )
    } else return (
        <React.Fragment>
          <TopBar
            size='medium'
            title='Create a bot clone'
            text='Create a bot clone here.'
            backgroundUrl='https://advancedalgos.net/img/photos/ecosystem.jpg'
          />

          <div className='container'>
          <Paper className={classNames('container', classes.root)}>

          <form noValidate autoComplete="off" onSubmit={this.submitForm.bind(this)}>
              <Typography className={classes.typography} variant='h5' gutterBottom>
                Create a Bot Clone
              </Typography>

              <Typography className={classes.typography} variant='subtitle1' align='justify'>
                A bot clone it's a copy of your bot running on a virtual machine.
                At the moment Live clones trade by default 0.001 BTC on Poloniex.
                Please select the team and bot you want to clone!
              </Typography>

              <FormControl className={classNames(classes.form, classes.textField)} fullWidth>
                <InputLabel shrink htmlFor='select'>
                  Select Team and Bot
                </InputLabel>
                <Query query={teams.GET_ALL_TEAMS_QUERY} >
                  {({ loading, error, data }) => {
                    if (loading) {
                      return (
                        <Select
                          value='loading'
                          input={<Input />}
                          displayEmpty
                          className={classes.selectEmpty}
                          disabled
                        >
                          <MenuItem key='1' value='loading'>Loading...</MenuItem>
                        </Select>
                      )
                    } else if(!isDefined(data.teams_FbByTeamMember)){
                        return (
                          <Select
                            value='noteams'
                            input={<Input />}
                            displayEmpty
                            className={classes.selectEmpty}
                            disabled
                          >
                            <MenuItem key='1' value='noteams'>You don't have any teams yet.</MenuItem>
                          </Select>
                        )
                    } else if (error) return `Error! There has been an error loading teams.`

                    return (
                      <Select
                        value={this.state.teamId}
                        input={<Input />}
                        className={classes.selectEmpty}
                        onBlur={(e)=>this.setState({teamError:false})}
                        error={this.state.teamError}
                        onChange={e => this.setState({teamId:e.target.value})}
                      >
                        <MenuItem key={data.teams_FbByTeamMember.id}
                          value={data.teams_FbByTeamMember.id}>
                          {data.teams_FbByTeamMember.name + '/' + data.teams_FbByTeamMember.fb[0].name}
                        </MenuItem>
                      </Select>
                    )
                  }}
                </Query>
              </FormControl>

               <TextField
                  select
                  label="Running Mode"
                  className={classNames(classes.margin, classes.textField, classes.form)}
                  value={this.state.mode}
                  onChange={(e)=> this.setState({mode:e.target.value})}
                  onBlur={(e)=>this.setState({modeError:false})}
                  error={this.state.modeError}
                  fullWidth
                  >
                  {types.map(option => (
                    <MenuItem key={option} value={option}>
                      {option}
                    </MenuItem>
                  ))}
                </TextField>

                { this.state.mode == "Backtest" &&
                    <React.Fragment>
                      <DateTimePicker
                        autoOk
                        disableFuture
                        format="DD' at 'HH:mm"
                        ampm={false}
                        showTabs={false}
                        leftArrowIcon={<ChevronLeft />}
                        rightArrowIcon={<ChevronRight />}
                        value={this.state.beginDatetime}
                        label='Backtest Start Date'
                        onChange={newVal => this.setState({ beginDatetime: newVal })}
                        className={classNames(classes.form, classes.textField)}
                        fullWidth
                      />

                      <DateTimePicker
                        autoOk
                        disableFuture
                        format="DD' at 'HH:mm"
                        ampm={false}
                        showTabs={false}
                        leftArrowIcon={<ChevronLeft />}
                        rightArrowIcon={<ChevronRight />}
                        value={this.state.endDatetime}
                        label='Backtest End Date'
                        onChange={newVal => this.setState({ endDatetime: newVal })}
                        className={classNames(classes.form, classes.textField)}
                        fullWidth
                      />

                      <TextField
                        id="waitTime"
                        label="Wait Time"
                        className={classNames(classes.form, classes.textField)}
                        value={this.state.waitTime}
                        onChange={(e)=>this.setState({waitTime:e.target.value})}
                        fullWidth
                      />
                    </React.Fragment>
                }

              <Typography className={classes.typography} variant='subtitle1' align='justify'>
                If Run as Team is selected, the clone will be taken from the
                team respository instead of your own team member folder.
                Competitions runs from the team respository.
              </Typography>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={this.state.runAsTeam}
                    onChange={(e)=>this.setState({runAsTeam:e.target.checked })}
                    value="runAsTeam"
                    color="primary"
                  />
                }
                label="Run as Team"
                className={classNames(classes.form, classes.textField)}
              />

              <Typography className={classes.typography} variant='subtitle1' align='justify'>
                The Resume Execution option let's you pick up the context of
                the last execution and continue from there.
              </Typography>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={this.state.resumeExecution}
                    onChange={(e)=>this.setState({resumeExecution:e.target.checked })}
                    value="resumeExecution"
                    color="primary"
                  />
                }
                label="Resume Execution"
                className={classNames(classes.form, classes.textField)}
              />

              <div className={classes.actionButton} >
                 <Button
                   type="submit"
                   variant='contained' color='secondary'>
                   Clone Bot!
                 </Button>
               </div>

            </form>

            <Dialog
              open={this.state.isNewCloneConfirmationOpen}
              onClose={this.handleNewCloneConfirmationClose}
              aria-labelledby="alert-dialog-title"
              aria-describedby="alert-dialog-description"
            >
              <DialogTitle id="alert-dialog-title">Creating bot clone</DialogTitle>
              <DialogContent>
                <DialogContentText id="alert-dialog-description">
                  {this.state.serverResponse}
                </DialogContentText>
              </DialogContent>
              <DialogActions>
                <Button onClick={this.handleNewCloneConfirmationClose} color="primary" autoFocus>
                  Ok
                </Button>
              </DialogActions>
            </Dialog>
        </Paper>
        </div>
      </React.Fragment>
    );
  }

  async submitForm(e){
    e.preventDefault()
    let error = this.validate()
    if (!error){
      let serverResponse = await this.createCloneOnServer()
      error = serverResponse.errors || !isDefined(serverResponse.data.operations_AddClone)
      if(error){
        this.state.serverResponse = serverResponse.errors[0].message
        this.state.serverError = true
      }else{
        this.state.serverResponse = "The new clone was sucessfully created."
        this.state.serverError = false
      }

      this.handleNewCloneConfirmationOpen()
    }
  }

  async createCloneOnServer(){
    let variables = {
      clone:{
        teamId: this.state.teamId,
        botId: this.state.botId,
        mode: this.state.mode,
        resumeExecution: this.state.resumeExecution,
        runAsTeam: this.state.runAsTeam
      }
    }

    if(this.state.mode == "Backtest"){
      variables.clone.beginDatetime = this.state.beginDatetime.valueOf() / 1000|0
      variables.clone.endDatetime = this.state.endDatetime.valueOf() / 1000|0
      variables.clone.waitTime = this.state.waitTime
    }

    return this.props.addCloneMutation({
      variables: variables
      //refetchQueries: [{query: getClonesQuery}],
    })
  }

  handleNewCloneConfirmationOpen = () => {
    this.setState({ isNewCloneConfirmationOpen: true })
  };

  handleNewCloneConfirmationClose = () => {
    this.setState({
      isNewCloneConfirmationOpen: false
    })

    if(!this.state.serverError)
      this.setState({
        teamId:'',
        botId:'',
        mode:'',
        resumeExecution: false,
        beginDatetime: DateTime.local().minus({ days: 8 }).startOf('day'),
        endDatetime: DateTime.local(),
        waitTime: 1,
        state : '',
        stateDatetime: 0,
        createDatetime: 0,
        runAsTeam: false,

        //Error handlers
        nameError: false,
        teamError: false,
        botError: false,
        modeError: false,
        isNewCloneConfirmationOpen: false,
        serverResponse: '',
        serverError: false
      })
  };

  validate(){
    let isError = false

    if(this.state.teamId.length < 1) {
      isError = true
      this.setState(state => ({ teamError: true }));
    }

    if(this.state.mode.length < 1) {
      isError = true
      this.setState(state => ({ modeError: true }));
    }

    return isError;

  }
}

export default compose(
  graphql(clones.OPERATIONS_ADD_CLONE, { name:'addCloneMutation' }),
  withStyles(styles)
)(AddClone)
