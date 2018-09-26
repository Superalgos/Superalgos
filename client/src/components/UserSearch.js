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
import TextField from '@material-ui/core/TextField'

// components
import UserProfile from './UserProfile';

// Images
import PortraitImage from '../img/portrait.jpg'

const styles = theme => ({
  root: {
    flexGrow: 1,
    padding: 60,
    margin: 2,
  },
  card: {
    maxWidth: 145,
    minWidth: 100,
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
    paddingTop: '30',
    marginTop:30
  },
  inputField: {
    width: '80%',
    marginLeft: '10%',
    marginTop: 25
  },
});

class UserSearch extends Component {

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

  submitForm (e) {
    e.preventDefault()
  }

  handleTextField (e) {
      /*
      We will do some basic input validations here. If something is wrong we will turn on the error sign on the textfield.
      */

    let value = e.target.value

    switch (e.target.id) {
      case 'alias':
        if (value.length > 30) {
          this.setState({aliasError: true})
        } else {
          this.setState({aliasError: false, alias: value})
        }
        break
      case 'firstName':
        if (value.length > 30) {
          this.setState({firstNameError: true})
        } else {
          this.setState({firstNameError: false, firstName: value})
        }
        break
      case 'middleName':
        if (value.length > 30) {
          this.setState({middleNameError: true})
        } else {
          this.setState({middleNameError: false, middleName: value})
        }
        break
      case 'lastName':
        if (value.length > 50) {
          this.setState({lastNameError: true})
        } else {
          this.setState({lastNameError: false, lastName: value})
        }
        break
      default:
    }
  }
  
  displayUsers(){
    let data = this.props.getUsersQuery;
    const { classes } = this.props;

    if(data.loading){
      return ( <div> Loading Users... </div>);
    } else {
      return data.users.map(user => {
        
        return (
            
          <Grid key={user.id} item>
            <Card className={classes.card}  onClick={ (e) => {
              this.setState({ selected: user.id});
              }
            }>
              <CardActionArea>
                <CardMedia
                  className={classes.media}
                  image={PortraitImage}
                  title="User Profile"

                />
                <CardContent>
                  <Typography gutterBottom variant="headline" component="h2">
                    {user.alias}
                  </Typography>
                </CardContent>
              </CardActionArea>
              <CardActions>
                <Grid container justify="center" spacing={8}>
                   <Grid item>
                     <Button color="primary">
                       Select
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
      <Paper className={classes.root}>
        <form onSubmit={this.submitForm.bind(this)}>

        <TextField
          error={this.state.aliasError}
          id='alias'
          type='text'
          value={this.state.alias}
          label='Alias'
          className={classes.inputField}
          onChange={this.handleTextField.bind(this)}
                   />
                   
        <TextField
          error={this.state.firstNameError}
          id='firstName'
          type='text'
          value={this.state.firstName}
          label='First Name'
          className={classes.inputField}
          onChange={this.handleTextField.bind(this)}
                   />

        <TextField
          error={this.state.middleNameError}
          id='middleName'
          type='text'
          value={this.state.middleName}
          label='Middle Name'
          className={classes.inputField}
          onChange={this.handleTextField.bind(this)}
                   />

        <TextField
          error={this.state.lastNameError}
          id='lastName'
          type='text'
          value={this.state.lastName}
          label='Last Name'
          className={classes.inputField}
          onChange={this.handleTextField.bind(this)}
                   />
        
        <Grid container className={classes.grid} justify="center" spacing={24}>
          {this.displayUsers()}
        </Grid>
        
      </form>
    </Paper>
    );
  }
}

export default compose(
  graphql(getUsersQuery, {name: "getUsersQuery"}),
  withStyles(styles)
) (UserSearch); // This technique binds more than one query to a single component.
