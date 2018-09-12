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

const styles = {
  card: {
    maxWidth: 345,
  },
  media: {
    // ⚠️ object-fit is not supported by IE11.
    objectFit: 'cover',
  },
};

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
          <Card key={user.id} className={classes.card}  onClick={ (e) => {
            this.setState({ selected: user.id});
            }
          }>
            <CardActionArea>
              <CardMedia
                className={classes.media}
                image="/static/images/cards/contemplative-reptile.jpg"
                title="Contemplative Reptile"
              />
              <CardContent>
                <Typography gutterBottom variant="headline" component="h2">
                  {user.alias}
                </Typography>
                <Typography component="p">
                  Lizards are a widespread group of squamate reptiles, with over 6,000 species, ranging
                  across all continents except Antarctica
                </Typography>
              </CardContent>
            </CardActionArea>
            <CardActions>
              <Button size="small" color="primary">
                Share
              </Button>
              <Button size="small" color="primary">
                Learn More
              </Button>
            </CardActions>
          </Card>
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
