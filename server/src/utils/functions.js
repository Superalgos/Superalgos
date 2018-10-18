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

export default { capitalize, slugify }
