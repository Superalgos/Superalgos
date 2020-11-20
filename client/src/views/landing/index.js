import React from 'react'
import PropTypes from 'prop-types'

import Typography from '@material-ui/core/Typography'
import { withStyles } from '@material-ui/core/styles'

import { BannerTopBar } from '../common'

const styles = theme => ({
  container: {
    width: 'auto',
    marginTop: theme.spacing.unit * 3,
    marginLeft: theme.spacing.unit * 3,
    marginRight: theme.spacing.unit * 3,
    marginBottom: theme.spacing.unit * 6,
    [theme.breakpoints.up(800 + theme.spacing.unit * 3 * 2)]: {
      width: 800,
      marginLeft: 'auto',
      marginRight: 'auto'
    }
  }
})

const Landing = ({ classes, ...props }) => (
  <React.Fragment>
    <BannerTopBar size='big' title='Teams Module' text='Responsible for all teams at Advanced Algos.' backgroundUrl='https://superalgos.org/img/photos/teams.jpg' />
    <div className='homePage container'>
      <Typography variant='h1' align='center' className='title'>
        Welcome to the Teams Module!
      </Typography>
      <Typography variant='h2' align='center' className='subtitle'>
        Multidisciplinary groups of humans joining forces to breed financial beings and compete.
      </Typography>
      <div className='column'>
        <Typography align='justify'>
          One of the core propositions of the Superalgos projects revolves around people teaming up to breed financial beings and compete in algorithmic trading competitions. Both developing and competing are team activities.
        </Typography>
      </div>
      <div className='column'>
        <Typography align='justify'>
          You may join and participate in as many teams as you wish.
        </Typography>
        <Typography align='justify'>
          When you create your own team, you become the team’s owner and may allow more people in the team at your sole discretion. It has been shown that larger teams tend to become more intelligent.
        </Typography>
      </div>
    </div>
  </React.Fragment>
)

Landing.propTypes = {
  classes: PropTypes.object.isRequired
}

export default withStyles(styles)(Landing)
