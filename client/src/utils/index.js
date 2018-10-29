export const toLocalTime = (epoch) => {
  let localDate = new Date(0)
  localDate.setUTCSeconds(epoch)
  var options = { year: 'numeric', month: 'long', day: '2-digit' }
  return localDate.toLocaleDateString(options) + ' ' + localDate.toLocaleTimeString('en-US')
}
