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

// components
import UserProfile from './UserProfile';

// Images

import PortraitImage from '../img/portrait.jpg'

const styles = theme => ({
  card: {
    maxWidth: 345,
    paddingTop:'30'
  },
  media: {
    height: 0,
    paddingTop: '56.25%', // 16:9,
    marginTop:'30'
  },
  horizontal:
   {
     display: 'inline',
     margin: theme.spacing.unit,
   },
});

class UserList extends Component {

  constructor(props){
    super(props);
    this.state = {
      selected: null
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

          <li key={user.id} className={classes.horizontal}>
            <Card className={classes.card}  onClick={ (e) => {
              this.setState({ selected: user.id});
              }
            }>
              <CardActionArea>
                <CardMedia
                  className={classes.media}
                  image={PortraitImage}
                  title="Contemplative Reptile"

                />
                <CardContent>
                  <Typography gutterBottom variant="headline" component="h2">
                    {user.alias}
                  </Typography>
                  <Typography component="p">
                    I am a computer nerd passionate about crypto trading. I entered the crypto space in 2013 and since then I ve been participating in quite a few crypto open source projects.
                  </Typography>
                </CardContent>
              </CardActionArea>
              <CardActions>
                <Button size="small" color="primary">
                  User Profile
                </Button>
                <Button disabled size="small" color="primary">
                  Extended Profile
                </Button>
              </CardActions>
            </Card>
          </li>
        )
      });
    }
  }

  render() {

    return (
      <div>
        <ul>
          {this.displayUsers()}
        </ul>
        <UserProfile userId={this.state.selected}/>
      </div>
    );
  }
}

export default compose(
  graphql(getUsersQuery, {name: "getUsersQuery"}),
  withStyles(styles)
) (UserList); // This technique binds more than one query to a single component.
