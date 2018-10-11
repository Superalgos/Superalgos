# Refactoring Modules for use within Master app

1. Add `basename={window.location.pathname}` to BrowserRouter props in App.js.
2. Update Router paths. Remove home, callback routes.
3. Remove Material-ui theme provider.
4. Remove Apollo React.
5. Update auth handling. Pass as props or pull from local storage.
6. Remove header and footer.
