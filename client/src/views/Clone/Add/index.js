import React, { Component } from 'react'
import { graphql, compose, Query } from 'react-apollo'
import { clones, teams, keys } from '../../../GraphQL/Calls'
import { DateTime } from 'luxon';
import TopBar from '../../BannerTopBar'
import { withStyles } from '@material-ui/core/styles'
import classNames from 'classnames'
import styles from './styles'
import { isDefined } from '../../../utils'
import {
  tradingStartModes, availableTimePeriods,
  sensorProcessNames, indicatorProcessNames, botTypes, exchanges, markets, baseAssets
} from '../../../GraphQL/models'

import {
  MenuItem, Button, TextField, FormControl, InputLabel, Input, Typography,
  Paper, Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions,
  Select, FormControlLabel, Checkbox, FormHelperText
} from '@material-ui/core'
import { DateTimePicker } from 'material-ui-pickers'
import { ChevronLeft, ChevronRight } from '@material-ui/icons'

class AddClone extends Component {

  constructor(props) {
    super(props)
    let user = localStorage.getItem('user')
    this.state = {
      user: JSON.parse(user),
      selectedBot: { 'id': '' },
      mode: tradingStartModes.backtest,
      resumeExecution: false,
      beginDatetime: DateTime.utc().minus({ days: 8 }).startOf('day'),
      endDatetime: DateTime.utc(),
      waitTime: 1,
      state: '',
      stateDatetime: 0,
      createDatetime: 0,
      teams: [],
      teamId: '',
      keyId: '',
      exchangeName: exchanges.Poloniex,
      processName: indicatorProcessNames.Daily,
      accessCodeOption: false,
      accessCode: '',
      baseAssetBalance: 0,
      market: markets.USDT_BTC,
      baseAsset: baseAssets.assetA,

      // Indicator Bot
      startYear: 2019,
      endYear: 2019,
      month: 1,

      //TradingBot
      timePeriod: '',

      //Error handlers
      botError: false,
      modeError: false,
      isNewCloneConfirmationOpen: false,
      serverResponse: '',
      serverError: false,
      processNameError: false,
      keyIdError: false,
      accessCodeError: false,
      baseAssetBalanceError: false
    }
  }

  render() {
    const { classes } = this.props
    if (!isDefined(this.state.user)) {
      return (
        <TopBar
          size='big'
          title='Create a bot clone'
          text="Please login to create a bot clone."
          backgroundUrl='https://superalgos.org/img/photos/clones-original.jpg'
        />
      )
    } else return (
      <React.Fragment>
        <TopBar
          size='medium'
          title='Create a bot clone'
          text='Create a bot clone here.'
          backgroundUrl='https://superalgos.org/img/photos/clones-original.jpg'
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

                    if (!isDefined(data.teams_TeamsByOwner)) {
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
                    } else {
                      this.teams = data.teams_TeamsByOwner
                    }

                    return (
                      <Select
                        value={this.state.selectedBot.id}
                        displayEmpty
                        className={classes.selectEmpty}
                        onBlur={(e) => this.setState({ botError: false })}
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

              <TextField label="Exchange"
                select
                className={classNames(classes.margin, classes.textField, classes.form)}
                value={this.state.exchangeName}
                onChange={(e) => this.setState({ exchangeName: e.target.value })}
                fullWidth
              >
                {Object.keys(exchanges).map((option, index) => (
                  <MenuItem key={index} value={option}>
                    {option}
                  </MenuItem>
                ))}
              </TextField>

              <TextField label="Simulation Time Period Output to use"
                select
                className={classNames(classes.margin, classes.textField, classes.form)}
                value={this.state.timePeriod}
                onChange={(e) => this.setState({ timePeriod: e.target.value })}
                fullWidth
              >
                {availableTimePeriods.map((option, index) => (
                  <MenuItem key={index} value={option}>
                    {option}
                  </MenuItem>
                ))}
              </TextField>

              {this.state.selectedBot.kind === botTypes.Trading &&
                <React.Fragment>

                  <TextField label="Market"
                    select
                    className={classNames(classes.margin, classes.textField, classes.form)}
                    value={this.state.market}
                    onChange={(e) => this.setState({ market: e.target.value })}
                    fullWidth
                  >
                    {Object.keys(markets).map((option, index) => (
                      <MenuItem key={index} value={option}>
                        {option}
                      </MenuItem>
                    ))}
                  </TextField>

                  <TextField label="Base Asset"
                    select
                    className={classNames(classes.margin, classes.textField, classes.form)}
                    value={this.state.baseAsset}
                    onChange={(e) => this.setState({ baseAsset: e.target.value })}
                    fullWidth
                  >
                    {Object.keys(baseAssets).map((option, index) => (
                      <MenuItem key={index} value={option}>
                        {baseAssets[option]}
                      </MenuItem>
                    ))}
                  </TextField>

                  <Typography className={classes.typography} variant='subtitle1' align='justify'>
                    Available Running Modes are Backtest and Live.
                      <ul>
                      <li>  Backtest mode does NOT put real orders at the exchange;
                            it simulates the order execution at the specified price.
                        </li>
                      <li>
                        Live mode DOES put real orders at the exchange.
                        </li>
                    </ul>
                  </Typography>


                  <TextField label="Running Mode"
                    select
                    className={classNames(classes.margin, classes.textField, classes.form)}
                    value={this.state.mode}
                    onChange={(e) => this.setState({ mode: e.target.value })}
                    onBlur={(e) => this.setState({ modeError: false })}
                    error={this.state.modeError}
                    fullWidth
                  >
                    {Object.keys(tradingStartModes).map(option => (
                      <MenuItem key={option} value={option}>
                        {tradingStartModes[option]}
                      </MenuItem>
                    ))}
                  </TextField>

                  {this.state.mode == "backtest" &&
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
                    </React.Fragment>
                  }

                  {this.state.mode == "live" &&
                    <React.Fragment>
                      <Typography className={classes.typography} variant='subtitle1' align='justify'>
                        Select one of your available Exchange API Keys to be used by this clone.
                           </Typography>

                      <Query
                        query={keys.GET_ALL_KEYS}
                      >
                        {({ loading, error, data }) => {
                          if (loading) return (
                            <TextField
                              select
                              label="Exchange API Key"
                              className={classNames(classes.margin, classes.textField, classes.form)}
                              value={this.state.keyId}
                              onChange={(e) => this.setState({ keyId: e.target.value })}
                              onBlur={(e) => this.setState({ keyIdError: false })}
                              error={this.state.keyIdError}
                              fullWidth
                            >
                              <MenuItem key='1' value='Loading keys...'>
                                'Loading keys...'
                                    </MenuItem>
                            </TextField>
                          );
                          if (error) return `Error! ${error.message}`;
                          const list = data.keyVault_AvailableKeys.map((key) => (
                            <MenuItem key={key.id} value={key.id}>
                              {key.key.substr(0, 32) + "..." + " - " + key.exchange}
                            </MenuItem>
                          ));
                          return (
                            <TextField
                              select
                              label="Exchange API Key"
                              className={classNames(classes.margin, classes.textField, classes.form)}
                              value={this.state.keyId}
                              onChange={(e) => this.setState({ keyId: e.target.value })}
                              onBlur={(e) => this.setState({ keyIdError: false })}
                              error={this.state.keyIdError}
                              fullWidth
                            >
                              {list}
                            </TextField>
                          );
                        }}
                      </Query>

                      <Typography className={classes.typography} variant='subtitle1' align='justify'>
                        Because we are still in early alpha-testing phase,
                        Live Trading Clones are limited to an initial investment
                        of 0.001 BTC or 10 USDT. If you choose to run this bot or any modified
                        version of the code, you are doing it at your own risk.
                      </Typography>

                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={this.state.accessCodeOption}
                            onChange={(e) => this.setState({ accessCodeOption: e.target.checked })}
                            color="primary"
                          />
                        }
                        label="I have an Access Code"
                        className={classNames(classes.form, classes.textField)}
                      />

                    </React.Fragment>
                  }

                  {this.state.accessCodeOption &&
                    <React.Fragment>
                      <Typography className={classes.typography} variant='subtitle1' align='justify'>
                        The Access Code is only used by alpha testers. Please contact the team for more details.
                      </Typography>
                      <TextField
                        label="Access Code"
                        className={classNames(classes.margin, classes.textField, classes.form)}
                        value={this.state.accessCode}
                        onChange={(e) => this.setState({ accessCode: e.target.value })}
                        onBlur={(e) => this.setState({ accessCodeError: false })}
                        error={this.state.accessCodeError}
                        fullWidth
                      />

                      <TextField
                        label="Initial Balance"
                        className={classNames(classes.margin, classes.textField, classes.form)}
                        value={this.state.baseAssetBalance}
                        onChange={(e) => this.setState({ baseAssetBalance: e.target.value })}
                        onBlur={(e) => this.setState({ baseAssetBalanceError: false })}
                        error={this.state.baseAssetBalanceError}
                        fullWidth
                      />
                    </React.Fragment>
                  }

                </React.Fragment>
              }

              {this.state.selectedBot.kind === botTypes.Indicator &&
                <React.Fragment>
                  <TextField label="Process Name"
                    select
                    className={classNames(classes.textField, classes.form)}
                    value={this.state.processName}
                    onChange={(e) => this.setState({ processName: e.target.value })}
                    onBlur={(e) => this.setState({ processNameError: false })}
                    error={this.state.processNameError}
                    fullWidth
                  >
                    {Object.keys(indicatorProcessNames).map((option, index) => (
                      <MenuItem key={index} value={indicatorProcessNames[option]}>
                        {indicatorProcessNames[option]}
                      </MenuItem>
                    ))}
                  </TextField>
                </React.Fragment>
              }

              {this.state.selectedBot.kind === botTypes.Sensor &&
                <React.Fragment>
                  <TextField label="Process Name"
                    select
                    className={classNames(classes.textField, classes.form)}
                    value={this.state.processName}
                    onChange={(e) => this.setState({ processName: e.target.value })}
                    onBlur={(e) => this.setState({ processNameError: false })}
                    error={this.state.processNameError}
                    fullWidth
                  >
                    {Object.keys(sensorProcessNames).map((option, index) => (
                      <MenuItem key={index} value={sensorProcessNames[option]}>
                        {sensorProcessNames[option]}
                      </MenuItem>
                    ))}
                  </TextField>
                </React.Fragment>
              }

              {(this.state.mode === "noTime" && this.state.selectedBot.kind === botTypes.Indicator) &&
                <React.Fragment>
                  <Typography className={classes.typography} variant='subtitle1' align='justify'>
                    The Resume Execution option let's you pick up the context of
                    the last execution and continue from there.
                            </Typography>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={this.state.resumeExecution}
                        onChange={(e) => this.setState({ resumeExecution: e.target.checked })}
                        value="resumeExecution"
                        color="primary"
                      />
                    }
                    label="Resume Execution"
                    className={classNames(classes.form, classes.textField)}
                  />
                  {!this.state.resumeExecution &&
                    <DateTimePicker
                      autoOk
                      disableFuture
                      format="DD' at 'HH:mm"
                      ampm={false}
                      showTabs={false}
                      leftArrowIcon={<ChevronLeft />}
                      rightArrowIcon={<ChevronRight />}
                      value={this.state.beginDatetime}
                      label='Start Date'
                      onChange={newVal => this.setState({ beginDatetime: newVal })}
                      className={classNames(classes.form, classes.textField)}
                      fullWidth
                    />
                  }

                </React.Fragment>
              }

              <Typography className={classes.typography} variant='subtitle1' align='justify'>
                You will be able to see the clone information under Active Clones.
                Whenever you decide to stop the clone you can delete it. On History Clones will find all deleted clones.
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
                <Button onClick={this.handleNewCloneConfirmationClose}
                  variant='contained' color='secondary' autoFocus>
                  Ok
                </Button>
              </DialogActions>
            </Dialog>
          </Paper>
        </div>
      </React.Fragment>
    );
  }

  setSelectedBot(botId) {
    if (isDefined(this.teams)) {
      for (var j = 0; j < this.teams.length; j++) {
        for (var i = 0; i < this.teams[j].fb.length; i++) {
          if (this.teams[j].fb[i].id === botId) {
            this.setState({ selectedBot: this.teams[j].fb[i] })
            this.setState({ teamId: this.teams[j].id })
            return
          }
        }
      }
    }
  }

  async submitForm(e) {
    e.preventDefault()
    let error = this.validate()
    if (!error) {
      let serverResponse = await this.createCloneOnServer()
      error = serverResponse.errors || !isDefined(serverResponse.data.operations_AddClone)
      if (error) {
        this.state.serverResponse = serverResponse.errors[0].message || serverResponse.errors[0]
        this.state.serverError = true
      } else {
        this.state.serverResponse = "The new clone was sucessfully created."
        this.state.serverError = false
      }

      this.handleNewCloneConfirmationOpen()
    }
  }

  async createCloneOnServer() {
    let variables = {
      clone: {
        teamId: this.state.teamId,
        botId: this.state.selectedBot.id,
        mode: this.state.mode,
        resumeExecution: this.state.resumeExecution,
        botType: this.state.selectedBot.kind,
        exchangeName: this.state.exchangeName
      }
    }

    if (this.state.selectedBot.kind === "Trading") {
      variables.clone.processName = 'Trading-Process'
      variables.clone.timePeriod = this.state.timePeriod
      variables.clone.baseAsset = this.state.baseAsset
      variables.clone.market = this.state.market
      if (this.state.mode === "backtest") {
        let beginDate = DateTime.fromISO(this.state.beginDatetime.toISO({ includeOffset: false }), { zone: "UTC" });
        let endDate = DateTime.fromISO(this.state.endDatetime.toISO({ includeOffset: false }), { zone: "UTC" });
        variables.clone.beginDatetime = beginDate.valueOf() / 1000 | 0
        variables.clone.endDatetime = endDate.valueOf() / 1000 | 0
        variables.clone.waitTime = this.state.waitTime
      } else {
        variables.clone.keyId = this.state.keyId
        variables.clone.accessCode = this.state.accessCode
        variables.clone.baseAssetBalance = Number(this.state.baseAssetBalance)
      }
    } else {
      let beginDate = DateTime.fromISO(this.state.beginDatetime.toISO({ includeOffset: false }), { zone: "UTC" });

      variables.clone.processName = this.state.processName
      variables.clone.startYear = this.state.startYear
      variables.clone.endYear = this.state.endYear
      variables.clone.month = this.state.month
      variables.clone.beginDatetime = beginDate.valueOf() / 1000 | 0
    }

    return this.props.addCloneMutation({
      variables: variables
    })
  }

  handleNewCloneConfirmationOpen = () => {
    this.setState({ isNewCloneConfirmationOpen: true })
  };

  handleNewCloneConfirmationClose = () => {
    this.setState({
      isNewCloneConfirmationOpen: false
    })

    if (!this.state.serverError)
      this.setState({
        selectedBot: { 'id': '' },
        mode: 'noTime',
        resumeExecution: false,
        beginDatetime: DateTime.utc().minus({ days: 8 }).startOf('day'),
        endDatetime: DateTime.utc(),
        waitTime: 1,
        state: '',
        stateDatetime: 0,
        createDatetime: 0,
        exchangeName: exchanges.Poloniex,
        processName: indicatorProcessNames.Daily,
        teams: [],
        teamId: '',
        keyId: '',
        accessCodeOption: false,
        accessCode: '',
        baseAssetBalance: 0,
        market: markets.USDT_BTC,
        baseAsset: baseAssets.assetA,

        // Indicator Bot
        startYear: 2019,
        endYear: 2019,
        month: 1,

        //TradingBot
        timePeriod: '',

        //Error handlers
        botError: false,
        modeError: false,
        isNewCloneConfirmationOpen: false,
        serverResponse: '',
        serverError: false,
        processNameError: false,
        keyIdError: false,
        accessCodeError: false,
        baseAssetBalanceError: false
      })
  };

  validate() {
    let isError = false

    if (this.state.selectedBot.id.length < 1) {
      isError = true
      this.setState(state => ({ botError: true }));
    }

    if (this.state.mode.length < 1) {
      isError = true
      this.setState(state => ({ modeError: true }));
    }

    if (this.state.selectedBot.kind === "Trading"
      && this.state.mode === 'noTime') {
      isError = true
      this.setState(state => ({ modeError: true }));
    }

    if (this.state.selectedBot.kind !== "Trading"
      && this.state.processName.length < 1) {
      isError = true
      this.setState(state => ({ processNameError: true }));
    }

    if (this.state.mode === 'live' && this.state.keyId.length < 1) {
      isError = true
      this.setState(state => ({ keyIdError: true }));
    }

    if (this.state.accessCodeOption) {
      if (this.state.accessCode.length < 1) {
        isError = true
        this.setState(state => ({ accessCodeError: true }));
      }
      if (this.state.baseAssetBalance.length < 1 || isNaN(this.state.baseAssetBalance)) {
        isError = true
        this.setState(state => ({ baseAssetBalanceError: true }));
      }
    }

    return isError;

  }

}

export default compose(
  graphql(clones.OPERATIONS_ADD_CLONE, { name: 'addCloneMutation' }),
  withStyles(styles)
)(AddClone)
