import React from 'react';
import { Mutation } from 'react-apollo';

import {
  Paper,
  Typography,
  AppBar,
  Tabs,
  Tab,
} from '@material-ui/core';
import {
  Face as BasicIcon,
  Alarm as TechnicalIcon,
  Group as TeamAndServerIcon,
  PresentToAll as PresentationIcon,
} from '@material-ui/icons';
import { withStyles } from '@material-ui/core/styles';
import styles from './styles';

import {
  Basic,
  PresentationPage,
  TeamsServer,
  Technical,
} from './Tabs';

import { hostedEventsCalls } from '../../../GraphQL/Calls/index';

function TabContainer(props) {
  return (
    <Typography component='div' style={{ padding: 8 * 3 }}>
      {props.children}
    </Typography>
  );
}

class Queried extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      value: 0,
      id: this.props.event.id,
      title: this.props.event.title,
      subtitle: this.props.event.subtitle,
      description: this.props.event.description,
      startDatetime: this.props.event.startDatetime * 1000,
      endDatetime: this.props.event.endDatetime * 1000,
      formulaId: this.props.event.formula.id,
      plotterId: this.props.event.plotter.id,
      prizes: this.counterremapPrizes(this.props.event.prizes),
      rules: this.props.event.rules,
    };
  }

  handleTabChange = (event, value) => {
    this.setState({ value });
  }

  handleEventChange = (newType, newVal) => {
    this.setState({ [newType]: newVal });
  }

  counterremapPrizes = (prizes) => {
    const counterremapPrizes = [];
    prizes.forEach((prize) => {
      counterremapPrizes.push({
        from: parseInt(prize.condition.from, 10),
        to: parseInt(prize.condition.to, 10),
        additional: prize.condition.additional,
        amount: parseInt(prize.pool.amount, 10),
        asset: prize.pool.asset,
      });
    });
    return counterremapPrizes;
  }

  remapPrizes = (prizes) => {
    const remappedPrizes = [];

    prizes.forEach((prize) => {
      remappedPrizes.push({
        condition: {
          from: parseInt(prize.from, 10),
          to: parseInt(prize.to, 10),
          additional: prize.additional,
        },
        pool: {
          amount: parseInt(prize.amount, 10),
          asset: prize.asset,
        },
      });
    });
    return remappedPrizes;
  }

  render() {
    const {
      id,
      title,
      subtitle,
      description,
      startDatetime,
      endDatetime,
      value,
      formulaId,
      plotterId,
      prizes,
      rules,
    } = this.state;
    const { classes } = this.props;
    return (
      <React.Fragment>
        <Mutation mutation={hostedEventsCalls.EVENTS_EDITEVENT}
          update={(store, { data }) => {
            this.props.history.push(`/events/edit/${data.events_EditEvent.id}`);
          }}
        >
          {editHosted => (
            <div className={classes.root}>
              <AppBar position='static' color='default'>
                <Tabs
                value={value}
                onChange={this.handleTabChange}
                scrollable
                scrollButtons='off'
                indicatorColor='primary'
                textColor='primary'
              >
                  <Tab
                  className={classes.tabTitle}
                  label='Basic information'
                  icon={<BasicIcon />}
                />
                  <Tab
                  className={classes.tabTitle}
                  label='Technical information'
                  icon={<TechnicalIcon />}
                />
                  <Tab
                  className={classes.tabTitle}
                  label='Teams &amp; server setup(disabled)'
                  icon={<TeamAndServerIcon />}
                  disabled
                />
                  <Tab
                  className={classes.tabTitle}
                  label='Presentation page(disabled)'
                  icon={<PresentationIcon />}
                  disabled
                />
                </Tabs>
              </AppBar>
              <div className='container'>
                <Paper className={classes.paperRoot}>
                  <Typography className={classes.typography} variant='h5' gutterBottom>
                    Edit an event
                  </Typography>
                  {value === 0 && <TabContainer>
                    <Basic
                      event={{
                        id,
                        title,
                        subtitle,
                        description,
                        startDatetime,
                        endDatetime,
                        prizes,
                        rules,
                      }}
                      edit={(newType, newVal) => this.handleEventChange(newType, newVal)}
                      saveChanges={() => editHosted({
                        variables: {
                          eventId: id,
                          event: {
                            title,
                            subtitle,
                            description,
                            startDatetime: startDatetime.valueOf() / 1000,
                            endDatetime: endDatetime.valueOf() / 1000,
                            formulaId,
                            plotterId,
                            prizes: this.remapPrizes(prizes),
                            rules,
                          },
                        },
                      })}
                    />
                  </TabContainer>}
                  {value === 1 && <TabContainer>
                    <Technical
                      event={{
                        formulaId,
                        plotterId,
                        prizes,
                        rules,
                      }}
                      edit={(newType, newVal) => this.handleEventChange(newType, newVal)}
                      saveChanges={() => editHosted({
                        variables: {
                          eventId: id,
                          event: {
                            title,
                            subtitle,
                            description,
                            startDatetime: startDatetime.valueOf() / 1000,
                            endDatetime: endDatetime.valueOf() / 1000,
                            formulaId,
                            plotterId,
                            prizes: this.remapPrizes(prizes),
                            rules,
                          },
                        },
                      })}
                    />
                  </TabContainer>}
                  {value === 2 && <TabContainer><TeamsServer /></TabContainer>}
                  {value === 3 && <TabContainer><PresentationPage /></TabContainer>}
                </Paper>
              </div>
            </div>
          )}
        </Mutation>
      </React.Fragment>
    );
  }
}

export default withStyles(styles)(Queried);
