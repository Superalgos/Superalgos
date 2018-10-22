export const toLocalTime = (epoch) => {
  let localDate = new Date(0)
  localDate.setUTCSeconds(epoch)
  return localDate.toString()
}
