/*
 * Port of the old UI's helpers.formatDate (utils/helpers.js): relative
 * timestamps for post headers ("5 min", "3 hrs", "2 days", "1 wk", or a
 * full date past a month).
 */
export function formatDate(timestamp?: number): string {
  if (!timestamp) return ''
  const now = new Date()
  const joinedDate = new Date(timestamp)
  const diffInMs = now.getTime() - joinedDate.getTime()
  const diffInDays = diffInMs / (1000 * 60 * 60 * 24)

  if (diffInDays < 1) {
    const diffInHours = diffInMs / (1000 * 60 * 60)
    if (diffInHours < 1) {
      const diffInMinutes = diffInMs / (1000 * 60)
      return `${Math.floor(diffInMinutes)} min${diffInMinutes >= 2 ? 's' : ''}`
    }
    return `${Math.floor(diffInHours)} hr${diffInHours >= 2 ? 's' : ''}`
  } else if (diffInDays < 7) {
    return `${Math.floor(diffInDays)} day${diffInDays >= 2 ? 's' : ''}`
  } else if (diffInDays < 30) {
    const diffInWeeks = diffInDays / 7
    return `${Math.floor(diffInWeeks)} wk${diffInWeeks >= 2 ? 's' : ''}`
  } else {
    return joinedDate.toLocaleString('en-US', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    })
  }
}
