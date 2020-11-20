import logger from '../logger'

export const moduleAuth = async (req, res, next, db) => {
  if (req.headers.preshared === process.env.PRESHARED_GATEWAY_KEY) {
    logger.info('Module authenticated')
    next();
  } else {
    logger.error('Module authentication error')
    res.send(wrongPreshared);
  }
}

export default moduleAuth
