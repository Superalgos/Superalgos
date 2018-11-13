import React, { Component } from 'react';
import {graphql, compose} from 'react-apollo';
import {getUsersQuery} from '../queries/queries';

// Materia UI

import { withStyles } from '@material-ui/core/styles';
import Card from '@material-ui/core/Card';
import CardActionArea from '@material-ui/core/CardActionArea';
import CardActions from '@material-ui/core/CardActions';
import CardContent from '@material-ui/core/CardContent';
import CardMedia from '@material-ui/core/CardMedia';
import Button from '@material-ui/core/Button';
import Typography from '@material-ui/core/Typography';
import Grid from '@material-ui/core/Grid';
import Paper from '@material-ui/core/Paper';

// Full screen dialog imports (still Material UI)

import PropTypes from 'prop-types';
import Dialog from '@material-ui/core/Dialog';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import IconButton from '@material-ui/core/IconButton';

import CloseIcon from '@material-ui/icons/Close';
import Slide from '@material-ui/core/Slide';

// components
import UserProfile from './UserProfile';

// Images
import UserDefaultPicture from '../img/user-default-pic.jpg'

const styles = theme => ({
  root: {
    paddingTop:30,
    paddingBottom:30,
    flexGrow: 1 
  },
  card: {
    maxWidth: 345,
    minWidth: 300,
    paddingTop:'30'
  },
  media: {
    height: 0,
    paddingTop: '56.25%', // 16:9,
    marginTop:'30',
    minWidth: 300
  },
  typography: {
    maxWidth: 345,
    minWidth: 300,
    paddingTop:'30'
  },
   appBar: {
  position: 'relative',
  },
  flex: {
    flex: 1,
  },
  grid: {
    paddingTop: 30,
    marginTop:'30'
  },
});

function Transition(props) {
  return <Slide direction="up" {...props} />;
}

class UserList extends Component {

  constructor(props){
    super(props);
    this.state = {
      selected: null,
      open: false
    }
  }

  handleClickOpen = () => {
    this.setState({ open: true });
  };

  handleClose = () => {
    this.setState({ open: false });
  };

  displayUsers(){
    
    let data = this.props.getUsersQuery;
    const { classes } = this.props;

    if(data.loading){
      return ( <div> Loading Users... </div>);
    } else {
      return data.users_Users.map(user => {

        return (

          <Grid key={user.id} item>
            <Card className={classes.card}  onClick={ (e) => {
              this.setState({ selected: user.id});
              }
            }>
              <CardActionArea>
                <CardMedia
                  className={classes.media}
                  image={UserDefaultPicture}
                  title="User Profile"

                />
                <CardContent>
                  <Typography gutterBottom variant="h5" component="h2">
                    {user.alias}
                  </Typography>
                  <Typography className={classes.typography} gutterBottom>
                    {user.bio}
                  </Typography>
                </CardContent>
              </CardActionArea>
              <CardActions>
                <Grid container justify="center" spacing={8}>
                   <Grid item>
                     <Button onClick={this.handleClickOpen}>User Profile</Button>
                     <Dialog
                       fullScreen
                       open={this.state.open}
                       onClose={this.handleClose}
                       TransitionComponent={Transition}
                     >
                       <AppBar className={classes.appBar}>
                         <Toolbar>
                           <IconButton color="inherit" onClick={this.handleClose} aria-label="Close">
                             <CloseIcon />
                           </IconButton>
                           <Typography variant="h6" color="inherit" className={classes.flex}>
                             User Profile
                           </Typography>
                           <Button color="inherit" onClick={this.handleClose}>
                             Close
                           </Button>
                         </Toolbar>
                       </AppBar>
                       <Paper className={classes.root}>
                         <UserProfile userId={this.state.selected}/>
                       </Paper>
                     </Dialog>
                   </Grid>
                   <Grid item>
                     <Button disabled color="primary">
                       Extended Profile
                     </Button>
                   </Grid>
                </Grid>
              </CardActions>
            </Card>
          </Grid>
        )
      });
    }
  }

  render() {
    const { classes } = this.props;
    return (
      <React.Fragment>
        <Grid container justify="center" spacing={40} className={classes.root}>
          {this.displayUsers()}
        </Grid>
      </React.Fragment>
    );
  }
}

UserList.propTypes = {
  classes: PropTypes.object.isRequired,
};

export default compose(
  graphql(getUsersQuery, {name: "getUsersQuery"}),
  withStyles(styles)
) (UserList); // This technique binds more than one query to a single component.
