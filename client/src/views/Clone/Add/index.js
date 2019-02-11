import React, { Component } from 'react'
import { graphql, compose, Query } from 'react-apollo'
import { clones, teams } from '../../../GraphQL/Calls'
import { DateTime } from 'luxon';

import TopBar from '../../BannerTopBar'

import { withStyles } from '@material-ui/core/styles'
import classNames from 'classnames'
import styles from './styles'

import { tradingStartModes, indicatorStartModes, availableMonths, processNames } from '../../../GraphQL/models'
import { isDefined, getIndicatorYears } from '../../../utils'

import {
   MenuItem, Button, TextField, FormControl, InputLabel, Input, Typography,
   Paper, Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions,
   Select, FormControlLabel, Checkbox, FormHelperText
} from '@material-ui/core'

import NumberFormat from 'react-number-format'

import { DateTimePicker } from 'material-ui-pickers'
import {
  ChevronLeft,
  ChevronRight,
} from '@material-ui/icons'

class AddClone extends Component {

  constructor(props){
    super(props)
    let user = localStorage.getItem('user')
    this.state = {
      user: JSON.parse(user),
      selectedBot: {'id':''},
      mode: '',
      resumeExecution: false,
      beginDatetime: DateTime.local().minus({ days: 8 }).startOf('day'),
      endDatetime: DateTime.local(),
      waitTime: 1,
      state: '',
      stateDatetime: 0,
      createDatetime: 0,
      runAsTeam: false,
      teams: [],
      teamId: '',

      // Indicator Bot
      startYear: 2019,
      endYear: 2019,
      month: 1,
      processName: '',

      //Error handlers
      nameError: false,
      teamError: false,
      botError: false,
      modeError: false,
      isNewCloneConfirmationOpen: false,
      serverResponse: '',
      serverError: false,
      processNameError: false
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
          backgroundUrl='https://superalgos.org/img/photos/ecosystem.jpg'
        />
      )
    } else return (
        <React.Fragment>
          <TopBar
            size='medium'
            title='Create a bot clone'
            text='Create a bot clone here.'
            backgroundUrl='https://superalgos.org/img/photos/ecosystem.jpg'
          />

          <div className='container'>
          <Paper className={classNames('container', classes.root)}>

          <form noValidate autoComplete="off" onSubmit={this.submitForm.bind(this)}>
              <Typography className={classes.typography} variant='h5' gutterBottom>
                Create a Bot Clone
              </Typography>

              <Typography className={classes.typography} variant='subtitle1' align='justify'>
                A bot clone it's a copy of your bot running on a virtual machine.
                Please select from your teams and bots the one you want to clone!
              </Typography>

              <FormControl className={classNames(classes.form, classes.textField)} fullWidth>
                <InputLabel shrink htmlFor='select'>
                  Select Team and Bot
                </InputLabel>
                <Query query={teams.GET_ALL_TEAMS_QUERY} >
                  {({ loading, error, data }) => {
                    if (error) return `Error! There has been an error loading teams.`

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
                    }

                    if(!isDefined(data.teams_TeamsByOwner)){
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
                    } else{
                      this.teams = data.teams_TeamsByOwner
                    }

                    return (
                        <Select
                          value={this.state.selectedBot.id}
                          displayEmpty
                          className={classes.selectEmpty}
                          onBlur={(e)=>this.setState({botError:false})}
                          error={this.state.botError}
                          onChange={e => this.setSelectedBot(e.target.value)}
                        >
                        {
                          data.teams_TeamsByOwner.map(team => (
                            team.fb.map(financialBeing => (
                              <MenuItem key={financialBeing.id} value={financialBeing.id}>
                                {team.name + '/' + financialBeing.name}
                              </MenuItem>
                            ))
                          ))
                        }
                        </Select>
                    )
                  }}
                </Query>
                <FormHelperText>{this.state.selectedBot.kind}</FormHelperText>
              </FormControl>

              { this.state.selectedBot.kind === "TRADER" &&
                  <React.Fragment>
                    <Typography className={classes.typography} variant='subtitle1' align='justify'>
                      At the moment Live Trading Clones trade by default 0.001 BTC on Poloniex.
                    </Typography>

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
                       {Object.keys(tradingStartModes).map(option => (
                         <MenuItem key={option} value={option}>
                           {tradingStartModes[option]}
                         </MenuItem>
                       ))}
                     </TextField>

                     { this.state.mode == "backtest" &&
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

                           <Typography className={classes.typography} variant='subtitle1' align='justify'>
                             The Wait Time represent the number of miliseconds the bot will wait between executions.
                           </Typography>

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
                  </React.Fragment>
               }

              { (this.state.selectedBot.kind === "INDICATOR"
                || this.state.selectedBot.kind === "EXTRACTOR") &&
                  <React.Fragment>
                    <TextField
                       label="Process Name"
                       className={classNames(classes.textField, classes.form)}
                       value={this.state.processName}
                       onChange={(e)=> this.setState({processName:e.target.value})}
                       onBlur={(e)=>this.setState({processNameError:false})}
                       error={this.state.processNameError}
                       fullWidth
                     />

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
                       {Object.keys(indicatorStartModes).map(option => (
                         <MenuItem key={option} value={option}>
                           {indicatorStartModes[option]}
                         </MenuItem>
                       ))}
                     </TextField>

                     { this.state.mode === "allMonths" &&
                         <React.Fragment>
                           <TextField
                              id="beginYearInput"
                              select
                              label="Start Year"
                              className={classNames(classes.textField, classes.form)}
                              value={this.state.startYear}
                              onChange={(e)=> this.setState({startYear:e.target.value})}
                              fullWidth
                              >
                              {getIndicatorYears().map((option, index) => (
                                <MenuItem key={option} value={index}>
                                  {option}
                                </MenuItem>
                              ))}
                            </TextField>

                            <TextField
                               id="endYearInput"
                               select
                               label="End Year"
                               className={classNames(classes.textField, classes.form)}
                               value={this.state.endYear}
                               onChange={(e)=> this.setState({endYear:e.target.value})}
                               fullWidth
                               >
                               {getIndicatorYears().map((option, index) => (
                                 <MenuItem key={option} value={index}>
                                   {option}
                                 </MenuItem>
                               ))}
                             </TextField>
                         </React.Fragment>
                     }

                     { this.state.mode === "oneMonth" &&
                         <React.Fragment>
                           <TextField
                              id="beginYearInput"
                              select
                              label="Year"
                              className={classNames(classes.textField, classes.form)}
                              value={this.state.startYear}
                              onChange={(e)=> this.setState({startYear:e.target.value})}
                              fullWidth
                              >
                              {getIndicatorYears().map((option, index) => (
                                <MenuItem key={option} value={index}>
                                  {option}
                                </MenuItem>
                              ))}
                            </TextField>

                            <TextField
                               id="endYearInput"
                               select
                               label="Month"
                               className={classNames(classes.textField, classes.form)}
                               value={this.state.month}
                               onChange={(e)=> this.setState({month:e.target.value})}
                               fullWidth
                               >
                               {availableMonths.map(option => (
                                 <MenuItem key={option} value={option}>
                                   {option}
                                 </MenuItem>
                               ))}
                             </TextField>
                         </React.Fragment>
                     }
                  </React.Fragment>
              }


               <Typography className={classes.typography} variant='subtitle1' align='justify'>
                  You will be able to query your clone information under Active Clones until it finishes the execution, then it will moved to the History.
               </Typography>

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

  setSelectedBot(botId){
    if(isDefined(this.teams)){
      for (var j = 0; j < this.teams.length; j++) {
        for (var i = 0; i < this.teams[j].fb.length; i++) {
          if(this.teams[j].fb[i].id === botId){
            this.setState({selectedBot:this.teams[j].fb[i]})
            this.setState({teamId:this.teams[j].id})
            return
          }
        }
      }
    }
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
        botId: this.state.selectedBot.id,
        mode: this.state.mode,
        resumeExecution: this.state.resumeExecution,
        botType: this.getBotTypeFromKind(this.state.selectedBot.kind)
      }
    }

    if(this.state.mode === "backtest"){
      variables.clone.beginDatetime = this.state.beginDatetime.valueOf() / 1000|0
      variables.clone.endDatetime = this.state.endDatetime.valueOf() / 1000|0
      variables.clone.waitTime = this.state.waitTime
    }

    if(this.state.selectedBot.kind === "TRADER"){
      variables.clone.runAsTeam = this.state.runAsTeam
      variables.clone.processName = 'Trading-Process'
    } else {
      variables.clone.processName = this.state.processName
      variables.clone.startYear = this.state.startYear
      variables.clone.endYear = this.state.endYear
      variables.clone.month = this.state.month
      variables.clone.runAsTeam = true
    }

    return this.props.addCloneMutation({
      variables: variables
    })
  }

  getBotTypeFromKind(kind){
    if(kind === 'TRADER')
      return 'Trading'
    else if(kind === 'INDICATOR')
      return 'Indicator'
    else if(kind === 'EXTRACTOR')
      return 'Extraction'
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
        selectedBot: {'id':''},
        mode: '',
        resumeExecution: false,
        beginDatetime: DateTime.local().minus({ days: 8 }).startOf('day'),
        endDatetime: DateTime.local(),
        waitTime: 1,
        state : '',
        stateDatetime: 0,
        createDatetime: 0,
        runAsTeam: false,
        processName: '',
        teams: [],
        teamId: '',

        //Error handlers
        nameError: false,
        teamError: false,
        botError: false,
        modeError: false,
        isNewCloneConfirmationOpen: false,
        serverResponse: '',
        serverError: false,
        processNameError: false
      })
  };

  validate(){
    let isError = false

    if(this.state.selectedBot.length < 1) {
      isError = true
      this.setState(state => ({ selectedBotError: true }));
    }

    if(this.state.mode.length < 1) {
      isError = true
      this.setState(state => ({ modeError: true }));
    }

    if(this.state.selectedBot.kind !== "TRADER"
        && this.state.processName.length < 1 ) {
      isError = true
      this.setState(state => ({ processNameError: true }));
    }

    return isError;

  }
}

export default compose(
  graphql(clones.OPERATIONS_ADD_CLONE, { name:'addCloneMutation' }),
  withStyles(styles)
)(AddClone)
