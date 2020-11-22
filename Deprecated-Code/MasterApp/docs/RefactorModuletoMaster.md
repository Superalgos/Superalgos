# Refactoring Modules for use within Master app

1. Add `basename={window.location.pathname}` to BrowserRouter props in App.js.
2. Update Router paths. Remove home, callback routes.
3. Remove Material-ui theme provider.
4. Remove Apollo React.
5. Update auth handling. Pass as props or pull from local storage.
6. Remove header and footer.
7. Update [Material-UI Typography variants](https://material-ui.com/style/typography/#migration-to-typography-v2)
8. Add react hot module: `npm i react-hot-loader -D`

## Developing Module with Master App

### Setup
The symlinks in
1. Navigate to your module client.
2. Run `npm link`
3. Navigate `MasterApp/client`.
4. Run `npm link [you-module-package]`. eg `npm link @superalgos/teams-client`
5. Start server: `npm run dev`
6. When a change is made in your module, after a second or two, the browser page should update without reloading.
