# Superalgos Docker Guide

## Table of Contents

- [Introduction](#introduction)
- [Installation](#installation)
  - [Mac OS](#mac-os)
  - [Windows](#windows)
  - [Linux and BSD](#linux-and-bsd)
- [Running Superalgos](#running-superalgos)
  - [Using Docker-Compose](#using-docker-compose)
- [Docker Best Practices](#docker-best-practices)
- [Docker Development Best Practices](#docker-development-best-practices)
  - [Dockerfile Best Practices](#dockerfile-best-practices)
  - [Twelve Factor App](#twelve-factor-app)

## Introduction

This walk through is broken up into to parts: a quick-start guide to running [Superalgos](https://github.com/Superalgos/Superalgos) with Docker and a deeper, more theoretical dive into containers with the hopes of explaining some of the design decisions.

[Superalgos](https://github.com/Superalgos/Superalgos), at its core, is a web application which also means it can be deployed inside a container like many other web applications. One of the leading platforms for operating containers is Docker. Docker can run on many different operating systems and compute platforms. The containers provide an easy, fast, repeatable, and secure way to deploy and distribute applications. While it doesn't take much experience to run containers or Docker, there are some basics that any user should learn in order to use the technology effectively.

Before getting started, be aware that Docker is not the originally intended method of running the [Superalgos](https://github.com/Superalgos/Superalgos) application and as such there are some drawbacks to doing so. Namely, you won't be able contribute back to the project or configure your Governance profile. We'll discuss this more later. Therefore, you should only consider using the Docker container for production deployments.

It is also worth noting that [Superalgos](https://github.com/Superalgos/Superalgos) is very resource intense so it is best to get acquainted with the software by running it on a fast computer with a good amount of RAM as opposed to a tiny, slow Raspberry Pi. But, once you are ready to run a production deployment, then a more economical server is preferred.

Docker container images are hosted on `ghcr`. You can browse the containers in the [Packages section of the code repository](https://github.com/users/Superalgos/packages/container/package/superalgos).

> **Note:** The container and the application are still under heavy development and testing. Please join the [Superalgos SysAdmins Group](https://t.me/superalgossysadmins) to discuss any issues you may run into.

## Installation

First, Docker Desktop needs to be installed on a Mac or Windows computer in order to run the containers. Linux and BSD users will need Docker Engine. Docker-compose is also recommended and it should be included with Docker Desktop, but it may need to be installed separately.

### Mac OS

Docker can be downloaded from the Docker Store following the [directions in the official Docker Docs](https://docs.docker.com/desktop/mac/install/). It can also be installed from the command line using Homebrew.

```shell
brew cask install docker
brew install docker-compose
```

Then, make sure Docker Desktop is running. An easy way to check is to push `Cmd + space` then type `docker.app` in the search bar. You should also see the little whale icon in the top menu bar near the clock.

### Windows

Windows requires a few more steps than Mac OS, but it can also be downloaded from the Docker Store following the [directions in the official Docker Docs](https://docs.docker.com/desktop/windows/install/). It can also be installed from the command line using Chocolatey.

```shell
choco install docker-desktop
```

Docker should automatically start after installation. If you don't see the whale icon in the tray by the clock, then find `Docker` in the start menu.

### Linux and BSD

On Linux and BSD systems, Docker can be installed using the preferred package manager. [Step by step instructions for many different distributions](https://docs.docker.com/engine/install/debian/) of Linux can be found in the official Docker Docs. Since [Superalgos](https://github.com/Superalgos/Superalgos) runs well on Raspberry Pi 4 single-board computers, I'm going to illustrate the commands necessary to run [Superalgos](https://github.com/Superalgos/Superalgos) on the Raspbian Linux distribution.

```shell
# install the requirements
sudo apt-get update
sudo apt-get install \
    apt-transport-https \
    ca-certificates \
    curl \
    gnupg \
    lsb-release

# add the gpg keys to verify the packages
curl -fsSL https://download.docker.com/linux/debian/gpg | sudo gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg

# configure the official repository
echo \
  "deb [arch=arm64 signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/debian \
  $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

# install docker engine
sudo apt-get update
sudo apt-get install docker-ce docker-ce-cli containerd.io docker-compose
```

Docker should automatically start when it is done installing. You can check its status with `systemctl status docker`. To make things easier, ensure your user is added to the `docker` group. Type `id` at the command prompt and you should see something like `groups=...999(docker)`. If you don't see it listed, you can add yourself with `sudo usermod -a -G docker <username>`.

## Running Superalgos

Now that we have Docker installed and running, we can run the container. The option `--rm` will remove the instance of the container when it is exited.

```shell
docker run --rm ghcr.io/superalgos/superalgos:latest
```

You'll see some messages showing the container being downloaded and then some messages from the application itself showing that it is starting up and ready to accept connections. We'll stop the container now and add in a few more options so make it more useful, so press `ctrl + c` to exit.

We'll need to expose some ports so we can actually connect to it from our browser. Also, we'll want to create a few directories on our host file system so we can save, or persist, data between container reboots.

- `-d` to run the container daemonized, in the background
- `-p` to map ports to the host system to allow connections
- `-v` to mount local directories inside the container to persist data
- `--name` to assign a name to the container for easier reference

```shell
# create the data directories
mkdir -p Data-Storage Log-Files My-Workspaces

# run the container with the extra options
docker run \
  -d \
  --rm \
  --name superalgos \
  --user $(id -u):$(id -g) \
  -p 18041:18041 \
  -p 34248:34248 \
  -v $(pwd)/Data-Storage:/app/Platform/Data-Storage \
  -v $(pwd)/Log-Files:/app/Platform/Log-Files \
  -v $(pwd)/My-Workspaces:/app/Platform/My-Workspaces \
  ghcr.io/superalgos/superalgos:latest
```

You can check the status of the container with `docker ps -a` and view the logs with `docker logs superalgos`.

Note that you will see one error in the log output informing you that `git` is not installed. This is intentional and is not required for the bot to function properly.

Now you can open your browser and load the application front end. Try loading `http://localhost:34248` if you are on the same computer that is running the container, otherwise use the host ip, for example `http://192.168.1.10:34248`.

If you want to stop the container, you can run `docker stop superalgos`. When you want to upgrade the container, use:

```shell
docker pull ghcr.io/superalgos/superalgos:latest
docker stop superalgos
docker run \
  -d \
  --rm \
  --name superalgos \
  --user $(id -u):$(id -g) \
  -p 18041:18041 \
  -p 34248:34248 \
  -v $(pwd)/Data-Storage:/app/Platform/Data-Storage \
  -v $(pwd)/Log-Files:/app/Platform/Log-Files \
  -v $(pwd)/My-Workspaces:/app/Platform/My-Workspaces \
  ghcr.io/superalgos/superalgos:latest
```

Let's stop the container for now (`docker stop superalgos`) and we'll run it again using `docker-compose`.

Continue reading the [Docker Command Line documentation](https://docs.docker.com/engine/reference/commandline/cli/) for more details.

### Using Docker-Compose

Docker-compose is a wrapper for the Docker API which makes it a little easier to maintain a declarative configuration for an application instead of using the direct command line commands. There is a sample docker-compose configuration included in the [Superalgos](https://github.com/Superalgos/Superalgos) which you can as the basis for your own configuration.

Let's download the sample and edit it. If you don't use `vim`, change that command for your preferred editor.

```shell
wget https://raw.githubusercontent.com/Superalgos/Superalgos/master/Docker/docker-compose.yml
vim docker-compose.yml
```

Now, let's change some of the settings:

```yaml
version: "3"
services:
  superalgos:
    image: ghcr.io/superalgos/superalgos:latest
    command: ["minMemo"]
    user: "$UID:$GID"
    ports:
      - '34248:34248'
      - '18041:18041'
    volumes:
      - ./Data-Storage:/app/Platform/Data-Storage
      - ./Log-Files:/app/Platform/Log-Files
      - ./My-Workspaces:/app/Platform/My-Workspaces
    restart: on-failure
```

You can see we have the same ports and volumes mapped. We also get a few extra settings like `command`, `environment`, and `restart`.

- `command` adds an extra setting to the main startup, so the application ends up running with the full command `node platform noBrowser minMemo`. The base of that command is defined as the `ENTRYPOINT` in the `Dockerfile` that builds the container.
- `user` defines the UID and GID the container should run as so that the data can be persisted with the correct permissions in the Data-Storage, Log-Files, and My-Workspaces directories that we created on the host. If you leave this out, the container will use the built in `superalgos` user which has `uid: 1001` and `gid: 1001`.  Instead of using variables, you could also hard-code these UID and GID numbers into the configuration.
- `restart` tells Docker to restart the container if an error occurs.

Save the file and exit the editor. If you are using `vim`, hit escape and then type `:wq!` or press `shift + Z + Z` (two capital Z's).

Now, start the container with `docker-compose up`. This will start the container in the foreground and you'll connect to the log output. Hit `ctrl + c` to exit. Going forward, you'll want to add the `-d` option to start the container and keep it running in the background.

```shell
# some preliminary configuration to set up the persistent data directories
mkdir -p Data-Storage Log-Files My-Workspaces
export UID=$(id -u)
export GID=$(id -g)

# run the container in the background
docker-compose up -d
```

Now you have several `docker-compose` commands at your disposal to interact with the container:

- `docker-compose ps` to see details of the container
- `docker-compose logs` to see the logs
- `docker-compose down` to stop and remove the instance of the container
- `docker-compose pull` to pull the container, or a new version of the `latest` tag

Putting some of those concepts together, you can keep the running container up to date with this one-liner:

```shell
docker-compose pull && docker-compose down && docker-compose up -d
```

Explore the full [Docker Compose documentation](https://docs.docker.com/compose/) for more information.

## Docker Best Practices

As with any technology, there are lots of ways of doing things. A lot of them will give the same end result, but some may have fewer steps, or be more secure, or be more maintainable. That is where "best practices" come in. They aren't there to necessarily tell you what to do and what not to do, but they are there to help guide you in the right direction. A lot of times, they help you avoid making architectural mistakes that could come back and bite you further down the road.

One general best practice when running a production deployment is to avoid breaking changes by pinning to specific container tags. The `shasum hash` and the `release` tags are the best to use. These will generally ensure you are always running the same code and it will only upgrade when configured to do so.  The other tags will change which code they are pointing to more frequently and without notice.

- `latest` : the absolute latest build
- `master` : the latest master branch build
- `develop` : the latest develop branch build
- `<shasum hash>` : a specific git commit hash
- `<release>` : corresponds with a Github Release (git tag), i.e. `beta-10`

## Docker Development Best Practices

Docker has many advantages which can aid in every step from development through production deployment. There are some useful tips located directly in the [Docker documentation](https://docs.docker.com/develop/dev-best-practices/). Concisely, they are to keep the build images small, a few tips on when and how to persist data, and to use CI/CD for testing and deployment. All of these tips are used in one way or another as a part of the [Superalgos](https://github.com/Superalgos/Superalgos) project.

- Use a minimal base image and multi-stage build. Superalgos is currently using an [alpine](https://www.alpinelinux.org/) base image but [distroless](https://github.com/GoogleContainerTools/distroless) is becoming more common and some times using a base image like [python-slim](https://hub.docker.com/_/python) is the bast that can be achieved.
- The images are quite large (around 2 GB in size), unfortunately, because the codebase itself is large. We've recently put in a lot of effort to make these images as small as possible.
- The images are built automatically using Github Actions when pull requests are merged.
- With the correct configuration, data, like data mine and trading bot information, is persisted to the host using volume mounts

### Dockerfile Best Practices

Docker maintains a list of [Dockerfile best practices](https://docs.docker.com/develop/develop-images/dockerfile_best-practices/) in their main documentation. These tips dictate many of the decisions around the Superalgos Dockerfile. Some of the tips that are used by [Superalgos](https://github.com/Superalgos/Superalgos) are listed below.

- Use `.dockerignore` to prevent unwanted data from entering the container. This keeps the container small but also enhances security to prevent secrets from leaking into a container by accident.
- Don't install unnecessary packages. In lieu of multi-stage builds, build caches and build dependencies are removed before finalizing the container. Only packages that are necessary for the execution of the application are installed. This is why `git` is not present.
- Minimize the number of layers. Many `RUN` commands are combined into one using `&&` in order to reduce the number of layers.
- Sort multiline arguments. This mostly enhances readability and maintainability.
- Leverage build cache. When testing locally, several of the tips above help leverage the build cache and speed up build times.

### Twelve Factor App

[Superalgos](https://github.com/Superalgos/Superalgos) is a web app but it was originally designed to be run on a local workstation or server on a trusted network. However, I don't think it would be prudent to talk about Docker best practices without mentioning the [Twelve Factor App](https://12factor.net/) manifesto. Over time, [Superalgos](https://github.com/Superalgos/Superalgos) itself may iterate and implement more and more of these principles as more people get involved and more people deploy production environments.

The Twelve Factors:

- Codebase: One codebase tracked in revision control, many deploys
  - Superalgos utilizes one GitHub repository
- Dependencies: Explicitly declare and isolate dependencies
  - Superalgos is a node.js app and uses npm to track and install dependencies
- Config: Store config in the environment
  - Superalgos does not use environment variables the moment for configuration. Options are passed on the command line at run time. Other configuration is hard coded into the Workspaces.
- Backing services: Treat backing services as attached resources
  - Superalgos connects to external services via API calls over HTTP (TCP)
- Build, release, run: Strictly separate build and run stages
  - Superalgos is deployed by end users in their own local environments
- Processes: Execute the app as one or more stateless processes
  - Superalgos is one application
- Port binding: Export services via port binding
  - Superalgos exposes an HTTP frontend port and a Websockets backend port (TCP)
- Concurrency: Scale out via the process model
  - Superalgos can be clustered but the front end and backend do not necessarily scale out independently from each other
- Disposability: Maximize robustness with fast startup and graceful shutdown
  - Superalgos is not stateless in that the data files must be persisted to disk. Also, Superalgos cannot run behind a load balancer and have requests randomly distributed to different backend servers.
- Dev/prod parity: Keep development, staging, and production as similar as possible
  - Superalgos doesn't have its own production environment but the container makes it easy to ensure development environments are the same as what a user will see when they deploy it for themselves in their own production environment.
- Logs: Treat logs as event streams
  - Superalgos sends its own application logs to standard out. The trading mine logs are sent to flat files (persisted through volume mounts)
- Admin processes: Run admin/management tasks as one-off processes
  - Superalgos does not have any admin or management tasks outside of what is used to create the container at build time.
