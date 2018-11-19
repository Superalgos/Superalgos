import React from 'react'
import { withStyles } from '@material-ui/core/styles'
import Footer from './footer'
import Header from './header'

// styles
import styles from './styles'

class Index extends React.Component {
  render () {
    return (
      <div className={this.props.classes.layout}>
        <Header auth={this.props.auth} />
        <div>{this.props.children}</div>
        <Footer />
      </div>
    )
  }
}

export default withStyles(styles)(Index)
