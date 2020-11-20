const getItem = async name => window.localStorage.getItem(name);
const setItem = async (name, value) => window.localStorage.setItem(name, value);
const removeItem = async name => window.localStorage.removeItem(name);

export {
  getItem,
  setItem,
  removeItem,
};
