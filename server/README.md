# Superalgos Notifications GraphQL API Server

This is the Superalgos Notifications Module server-side GraphQL API server. We use Docker to develop locally and for our production workflow.

This module currently has no client-side component. 

## Getting Started

Run
```
		npm install
```
then
```
		npm run dev
```

### Using Docker

Get latest Docker and Docker Compose: [https://docs.docker.com/compose/install/](https://docs.docker.com/compose/install/)

#### Using Docker container for Development

To run starter kit in development mode with hot code reload execute:

Run docker container in background:

```
docker-compose up -d
```

If image issues, try running:
```
docker-compose up --build
```
then run
```
docker-compose up -d
```

To view logs
```
docker-compose logs -f -t
```
Hit Ctrl + c to exit logs without stopping service

To stop service
```
docker-compose down
```

### Main Libraries

- [*Webpack 4*](https://webpack.js.org/):web application bundler. Allows us to us latest newer JS ECMA features that increase productivity and code clarity. Also allows additional libraries such as modular and programmable CSS via SASS/SCSS/LESS. Provides webserver for local development.
- [*Bulma CSS Framework*](https://bulma.io/documentation/): Bulma is a highly-customizable CSS-only framework allowing us to quickly prototype the layout of a webapp without being complicated by opinionated functionality represented in libraries such as Bootstrap or Material UI. Grants us the flexibility to create a custom look at top speed whilst minimizing baggage.
- [*HyperApp*](https://github.com/hyperapp/hyperapp): Allows a controlled Flux-styled approach to state-management and data-flow through components like React minus the excess boilerplate and learning curve.
- [*Docker*](https://www.docker.com/what-docker)

### File organization

```
.                               # Top level directory located at your choice
├── src		        
│   ├── actions   # Actions are functions that change the app state
│   ├── assets    # images, logos and other static assets
│   ├── state     # Schema of state — the single source of truth concerning app state.
│   ├── styles    # SASS/SCSS styles
│   ├── utils    	# Local storage and other utils
│   └── views     # Main folder for editing site content
│       ├─ nav    	# Nav components — header, footer, etc.
│       ├─ pages    	# Nav components — header, footer, etc.
│				│	 ├─ landing    # Homepage
│				│	 │	├─ sections    	# Homepage sections. Collated in its own index.js
│				│	 │	└─ index.js    	# Main homepage component. Pulls in sections
│				│	 └─ ...    	# Other page/component folders
│       └─ index.js   # Main view container. Main router
├── html		        
│   └── index.html   # index.html template pulled in by Webpack to attach transpiled bundles
├── index.js      # JS entry point to website
│
├── tools 				# utility scripts, mostly for webpack configuration
│            
├── node_modules  # created by running `npm install` in this packages root dir
├── dist          # created by `npm run develop` - a cache of bundled files served by Webpack for local development
└── build         # created by `npm run build` - location of deployable production bundle

```

## Deployment

The simplest deployment is compiling/transpiling the site to a distribution bundle and then uploading the files in the bundle to a web-accessible folder or storage.

For this application we use Webpack to transpile the application which combines and minimizes all code and assets into an optimized bundle without and of the development code and resources.

To build, run:
```
	npm run build
```
Looking in this packages directory, there should be a ./build directory with the final built files that can be uploaded.

### Create Docker image

```
  docker build -t aateamapi/prod .
```

### Deployment instructions

Coming soon...
