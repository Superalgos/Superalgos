# Superalgos Team Client-side Application

This is the Superalgos Team Module client-side web app a.k.a. single-page-application (SPA). We use Webpack 4 + Docker to develop locally, then build to a distribution bundle that can then be uploaded via FTP, git or used with a continuous integration workflow.

This webapp's server-side component is the [apit directory](../api#README).

## Getting Started

Run
```
		npm install
```
then
```
		npm run develop
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
- [*React*](https://reactjs.org/): A JavaScript library for building user interfaces.
- [*Material UI*](https://material-ui.com/): React components that implement Google's Material Design.
- [*Docker*](https://www.docker.com/what-docker)
