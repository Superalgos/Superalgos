export const toLocalTime = (epoch) => {
  let localDate = new Date(0)
  localDate.setUTCSeconds(epoch)
  var options = { year: 'numeric', month: 'long', day: '2-digit' }
  return (
    localDate.toLocaleDateString(options) +
    ' at ' +
    localDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
  )
}
