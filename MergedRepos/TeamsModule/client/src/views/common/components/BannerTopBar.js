import React from 'react'
import PropTypes from 'prop-types'
import Typography from '@material-ui/core/Typography'

const BannerTopBar = ({
  size,
  backgroundUrl,
  title,
  text
}) => (
  <div className={`bannerTopBar ${size}`} style={backgroundUrl ? { backgroundImage: `url(${backgroundUrl})` } : {}}>
    <div className='caption'>
      <Typography className='title' variant='h1' align='center'>{title}</Typography>
      <Typography className='text' variant='h2' align='center'>{text}</Typography>
    </div>
  </div>
)

BannerTopBar.propTypes = {
  backgroundUrl: PropTypes.string,
  size: PropTypes.string,
  title: PropTypes.string,
  text: PropTypes.string
}

export default BannerTopBar
