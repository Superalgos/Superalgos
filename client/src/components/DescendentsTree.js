import React, { Component } from 'react'
import {graphql, compose} from 'react-apollo'
import {getDescendentsQuery} from '../queries/queries'

// Materia UI

import { withStyles } from '@material-ui/core/styles'
import Card from '@material-ui/core/Card'
import CardActionArea from '@material-ui/core/CardActionArea'
import CardActions from '@material-ui/core/CardActions'
import CardContent from '@material-ui/core/CardContent'
import CardMedia from '@material-ui/core/CardMedia'
import Button from '@material-ui/core/Button'
import Typography from '@material-ui/core/Typography'
import Grid from '@material-ui/core/Grid'

// Material UI Nestled Lists
import ListSubheader from '@material-ui/core/ListSubheader';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import Collapse from '@material-ui/core/Collapse';
import InboxIcon from '@material-ui/icons/MoveToInbox';
import DraftsIcon from '@material-ui/icons/Drafts';
import SendIcon from '@material-ui/icons/Send';
import ExpandLess from '@material-ui/icons/ExpandLess';
import ExpandMore from '@material-ui/icons/ExpandMore';
import StarBorder from '@material-ui/icons/StarBorder';

// components
import UserProfile from './UserProfile'

// Images
import PortraitImage from '../img/portrait.jpg'

const styles = theme => ({
  card: {
    maxWidth: 150,
    minWidth: 150,
    paddingTop: '30'
  },
  media: {
    height: 0,
    paddingTop: '56.25%', // 16:9,
    marginTop: '30',
    minWidth: 300
  },
  typography: {
    maxWidth: 345,
    minWidth: 300,
    paddingTop: '30'
  },
  appBar: {
    position: 'relative'
  },
  flex: {
    flex: 1
  },
  grid: {
    paddingTop: '30',
    marginTop: 30
  },
  list: {
    width: '80%',
    marginLeft: '10%',
    marginTop: 25
  },
  button: {
    margin: theme.spacing.unit,
    marginTop: theme.spacing.unit * 3
  },
  nested: {
    paddingLeft: theme.spacing.unit * 4,
  },
})

class DescendentsTree extends Component {

  constructor (props) {
    super(props)

    this.state = {
      id: '',
      open: true
    }
  }

  handleClick = () => {
  this.setState(state => ({ open: !state.open }));
};

  displayNestedListItems(node) {

    const { classes } = this.props
    return node.descendents.map(descendent => {
    return (     
        <div>     
            <ListItem button className={classes.nested}>
              <ListItemIcon>
                <StarBorder />
              </ListItemIcon>
              <ListItemIcon>
                <StarBorder />
              </ListItemIcon>
              <Card className={classes.card}>
                <CardActionArea>
                  <CardMedia
                    className={classes.media}
                    image={PortraitImage}
                    title='User Profile'
        
                />
                  <CardContent>
                    <Typography gutterBottom variant='headline' component='h2'>
                      {descendent.alias}
                    </Typography>
                  </CardContent>
                </CardActionArea>
                <CardActions>
                  <Grid container justify='center' spacing={8}>
                    <Grid item />
                  </Grid>
                </CardActions>
              </Card>
            </ListItem>
            {this.displayNestedList(descendent)}
          </div>
        )
      }
    )
  }

  displayNestedList(descendent) {
    const primaryText = "Children of " + descendent.alias
    if (descendent.descendents !== undefined) {
      if (descendent.descendents.length > 0) {
        return(
          <List component="div" disablePadding>
            <ListItem button onClick={this.handleClick}>
              <ListItemText inset primary={primaryText} />
              {this.state.open ? <ExpandLess /> : <ExpandMore />}
            </ListItem>
            <Collapse in={this.state.open} timeout="auto" unmountOnExit>
              {this.displayNestedListItems(descendent)}
            </Collapse>
          </List>
        )
      } else {
        return (<div/>)
      }
    }    
  }

  
  displayTopList () {
    let data = this.props.data
    const { classes } = this.props

    if (data.loading) {
      return (<div> Loading Descendents... </div>)
    } else {
      if (data.descendents === undefined) {
        return (<div> No Descendents to Display </div>)
      } else {
        return data.descendents.map(descendent => {
          return (
            <div>
            
          <ListItem button>
          <ListItemIcon>
            <StarBorder />
          </ListItemIcon>
            <Card className={classes.card}>
              <CardActionArea>
                <CardMedia
                  className={classes.media}
                  image={PortraitImage}
                  title='User Profile'

              />
                <CardContent>
                  <Typography gutterBottom variant='headline' component='h2'>
                    {descendent.alias}
                  </Typography>
                </CardContent>
              </CardActionArea>
              <CardActions>
                <Grid container justify='center' spacing={8}>
                  <Grid item />
                </Grid>
              </CardActions>
            </Card>
          </ListItem>
          
          {this.displayNestedList(descendent)}
              
            </div>
          )
        })
      }
    }
  }

  render () {
    const { classes } = this.props
    return (
      <div>
      <List
       component="nav"
       subheader={<ListSubheader component="div">Your Children</ListSubheader>}
       className={classes.list}
     >
          {this.displayTopList()}
        </List>
      </div>
    )
  }
}

export default compose(
  graphql(getDescendentsQuery, { // What follows is the way to pass a parameter to a query.
    options: (props) => {
      return {
        variables: {
          name: 'getDescendentsQuery',
          id: props.userId
        }
      }
    }}),
  withStyles(styles)
)(DescendentsTree) // This technique binds more than one query to a single component.
