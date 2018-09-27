import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import AppBar from '@material-ui/core/AppBar';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import UpdateIcon from '@material-ui/icons/Create';
import ImageIcon from '@material-ui/icons/Wallpaper';
import ReferralsIcon from '@material-ui/icons/DeviceHub';
import Typography from '@material-ui/core/Typography';

// Components

import UserUpdate from './UserUpdate';
import UserImages from './UserImages';
import YourReferrer from './YourReferrer';

function TabContainer(props) {
  return (
    <Typography component="div" style={{ padding: 8 * 3 }}>
      {props.children}
    </Typography>
  );
}

TabContainer.propTypes = {
  children: PropTypes.node.isRequired,
};

const styles = theme => ({
  root: {
    flexGrow: 1,
    width: '100%',
    backgroundColor: theme.palette.background.paper,
    padding: 0,
    margin: 0,
  },
});

class UserTabs extends React.Component {
  state = {
    value: 0
  };

  handleChange = (event, value) => {
    this.setState({ value });
  };

  render() {
    const { classes } = this.props;
    const { value } = this.state;

    return (
      <div className={classes.root}>
        <AppBar position="static" color="default">
          <Tabs
            value={value}
            onChange={this.handleChange}
            scrollable
            scrollButtons="off"
            indicatorColor="primary"
            textColor="primary"
          >
            <Tab label="Profile Sheet" icon={<UpdateIcon />} />
            <Tab label="Profile Images" icon={<ImageIcon />} />
            <Tab label="Your Referrer" icon={<ReferralsIcon />} />
          </Tabs>
        </AppBar>
        {value === 0 && <TabContainer><UserUpdate/></TabContainer>}
        {value === 1 && <TabContainer><UserImages/></TabContainer>}
        {value === 2 && <TabContainer><YourReferrer/></TabContainer>}
      </div>
    );
  }
}

UserTabs.propTypes = {
  classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(UserTabs);
