export const capitalize = string => (string).charAt(0).toUpperCase() + (string).slice(1);

export const slugify = text => text.toString().toLowerCase()
  .replace(/\s+/g, '-')
  .replace(/[^\w-]+/g, '')
  .replace(/--+/g, '-')
  .replace(/^-+/, '')
  .replace(/-+$/, '');

export const epoch = () => Math.round(new Date().getTime() / 1000);

export const isBetween = (value, valA, valB) => {
  const min = valA < valB ? valA : valB;
  const max = valA > valB ? valA : valB;
  if (value >= min && value <= max) {
    return true;
  }
  return false;
};
