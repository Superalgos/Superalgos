# MasterApp
The Master App is an application layer that wraps the client-side web modules of the various Superalgos platform modules (Users, Teams, KeyVault, Events, etc).
It provides, to these modules, an authentication layer and GraphQL data layer, among other commonly used utilities and APIs.

Each client-side module is published as an NPM package and their function is best described as a
React higher-order component encasing their given module use cases.

## Developing with the Master App

### Getting Started

Clone the repo.

```
git clone https://github.com/Superalgos/MasterApp.git
cd MasterApp
```

**Setup Server**

```
cd server
npm install
```
Rename `.env.example` to `.env`

Start the server:

```
npm run start
```
The Graphql Playground will be viewable at [http://localhost:4100/graphql](http://localhost:4100/graphql)

**Setup Client**

In another CLI window, navigate to the MasterApp/client

```
cd ../client
npm install
```

Rename `.env.example` to `.env`. Get Auth0 Client ID from team member

Start the client:

```
npm run dev

# or if on windows
npm run dev_win
```

### Working with existing modules

Using the `npm link` command, we can develop a module locally before publishing as a package on npm.

In the client of the module to be developed:

```
npm link
```

Make note of the module package name — the name in the module's client package.json. *e.g. @superalgos/key-vault-client*

In the Master app client dir link the developing module:

```
# in MasterApp/client
npm link <module-package-name>

e.g.
npm link @superalgos/key-vault-client
```

### Starting a new module

*We are currently developing a boilerplate that will accelerate starting a new module and works easily within the MasterApp.*
