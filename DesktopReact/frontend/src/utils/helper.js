const isEmpty = (obj) => Object.values(obj).every(value => value === null || value === undefined || value === '');


export {
    isEmpty
}
