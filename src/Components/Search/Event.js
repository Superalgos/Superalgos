import React from 'react';
import { Link } from 'react-router-dom';
import { Mutation } from 'react-apollo';

import {
  Grid, Paper,
  Typography,
  Button,
  Select,
  MenuItem,
} from '@material-ui/core';
import { withStyles } from '@material-ui/core/styles';
import styles from './styles';
import { hostedEventsCalls } from '../../GraphQL/Calls/index';

import { toLocalTime } from '../../utils';

class Event extends React.Component {
  constructor() {
    super();
    this.state = {
      keyId: '',
      participantId: '',
      botId: '',
    };
  }

  render() {
    const { keyId, participantId, botId } = this.state;
    const {
      classes,
      event,
      availableKey = [],
      enrollable = false,
    } = this.props;
    const {
      id,
      title,
      subtitle,
      startDatetime,
      endDatetime,
      host,
      formula,
      description,
      participatingAs,
      canParticipateAs,
    } = event;

    const fbs = [];

    canParticipateAs.forEach((team) => {
      team.fb.forEach((finb) => {
        fbs.push({
          value: `${team.id}|${finb.id}`,
          text: `${team.name} > ${finb.name}`,
        });
      });
    });

    return (
      <Paper className={classes.card}>
        <Grid container spacing={16}>
          <Grid item xs>
            <Typography gutterBottom variant='h5'> {title} </Typography>
            <Typography gutterBottom variant='h6'> {subtitle} </Typography>
            <Typography gutterBottom>From : {toLocalTime(startDatetime)} </Typography>
            <Typography gutterBottom>To : {toLocalTime(endDatetime)} </Typography>
          </Grid>
          <Grid item xs>
            <Typography gutterBottom variant='h6'> Description : </Typography>
            <Typography gutterBottom> {description} </Typography>
          </Grid>
          <Grid item xs={12} sm container>
            <Grid item xs container direction='column' spacing={16}>
              <Grid item xs>
                <Typography gutterBottom>
                  Hosted by: {host.alias} ({host.lastName} {host.firstName})
                </Typography>
                <Typography gutterBottom>Formula: {formula.name} </Typography>
                <Typography gutterBottom>You are participating as : { participatingAs.map(team => `${team.name}, `) } </Typography>
              </Grid>
              <Grid item className={classes.buttonGrid}>
                { enrollable && fbs.length
                  ? <Mutation mutation={hostedEventsCalls.REGISTER_EVENT}
                      update={() => {
                        window.location.reload();
                      }}
                    >
                    {enrollToEvent => (
                      <React.Fragment>
                        <Select
                          value={`${participantId}|${botId}`}
                          onChange={(val) => {
                            this.setState({
                              participantId: val.target.value.split('|')[0],
                              botId: val.target.value.split('|')[1],
                            });
                          }}
                          name='bot'
                          displayEmpty
                          className={classes.selectEmpty}
                        >
                          <MenuItem value='|' disabled>
                            Enroll as :
                          </MenuItem>
                          { fbs.map(finb => <MenuItem
                            key={finb.value}
                            value={finb.value}>{finb.text}</MenuItem>) }
                        </Select>
                        <Select
                          value={keyId}
                          onChange={(val) => { this.setState({ keyId: val.target.value }); }}
                          name='key'
                          displayEmpty
                          className={classes.selectEmpty}
                        >
                          <MenuItem value='' disabled>
                            Select key
                          </MenuItem>
                          { availableKey.map(akey => <MenuItem
                            key={akey.id}
                            value={akey.id}>{akey.key}</MenuItem>) }
                        </Select>
                        <Button
                          className={classes.buttonList}
                          variant='outlined'
                          color='secondary'
                          size='small'
                          onClick={() => enrollToEvent({
                            variables: {
                              eventId: id,
                              keyId,
                              participantId,
                              botId,
                            },
                          })}
                        >
                          Enroll
                        </Button>
                      </React.Fragment>
                    )}
                  </Mutation>
                  : ''
                }
                <Button
                  className={classes.buttonList}
                  variant='outlined'
                  color='primary'
                  size='small'
                  component={Link}
                  to={`/events/show/${id}`}
                >
                  Show
                </Button>
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      </Paper>
    );
  }
}

export default withStyles(styles)(Event);
