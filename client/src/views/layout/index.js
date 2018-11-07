import React from 'react'
import { withStyles } from '@material-ui/core/styles'
import Footer from '../footer'
import Header from '../header'

// styles
import styles from './styles'

class Index extends React.Component {
  render () {
    return (
      <div className={this.props.classes.mainContainer}>
        <Header auth={this.props.auth} />
        {this.props.children}
        <Footer />
      </div>
    )
  }
}

export default withStyles(styles)(Index)
