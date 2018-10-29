export const capitalize = (string) => {
  return (string).charAt(0).toUpperCase() + (string).slice(1)
}

export const slugify = (text) => {
  return text.toString().toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-')
    .replace(/^-+/, '')
    .replace(/-+$/, '')
}

export const epoch = () => {
  return Math.round(new Date().getTime() / 1000)
}

export const isBetween = (value, valA, valB) => {
  const min = valA < valB ? valA : valB
  const max = valA > valB ? valA : valB
  if (value >= min && value <= max) {
    return true
  } else {
    return false
  }
}
