import React from 'react'
import PropTypes from 'prop-types'

import Typography from '@material-ui/core/Typography'

import Grid from '@material-ui/core/Grid'
import Card from '@material-ui/core/Card'
import CardMedia from '@material-ui/core/CardMedia'
import CardActions from '@material-ui/core/CardActions'
import Button from '@material-ui/core/Button'

import aaweb from '../../../assets/AlgonetWebPlatform.jpg'

export const DashEditor = ({ classes }) => (
  <Grid item md={6}>
    <Typography variant='h4' gutterBottom>
      Develop
    </Typography>
    <Grid container spacing={24}>
      <Grid item md={12}>
        <Card>
          <CardMedia
            className={classes.aawebMedia}
            image={aaweb}
            title='Image title'
          />
          <CardActions>
            <Typography variant='h6' color='inherit' aligh='right'>
              <Button>Start Developing ></Button>
            </Typography>
          </CardActions>
        </Card>
      </Grid>
    </Grid>
  </Grid>
)

DashEditor.propTypes = {
  classes: PropTypes.object.isRequired
}

export default DashEditor
