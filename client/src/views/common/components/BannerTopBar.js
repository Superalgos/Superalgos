import React from 'react'
import PropTypes from 'prop-types'
import Typography from '@material-ui/core/Typography'

const BannerTopBar = ({ size, backgroundUrl, title, text, children }) => (
  <div
    className={`bannerTopBar ${size}`}
    style={backgroundUrl ? { backgroundImage: `url(${backgroundUrl})` } : {}}
  >
    <div className='caption'>
      <Typography className='title' variant='h1' align='center'>
        {title}
      </Typography>
      <Typography className='text' variant='h2' align='center'>
        {text}
      </Typography>
      {children}
    </div>
  </div>
)

BannerTopBar.propTypes = {
  children: PropTypes.node,
  backgroundUrl: PropTypes.string,
  size: PropTypes.string,
  title: PropTypes.oneOfType([PropTypes.string, PropTypes.array]),
  text: PropTypes.oneOfType([PropTypes.string, PropTypes.array])
}

export default BannerTopBar
