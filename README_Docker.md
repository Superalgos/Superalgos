# Docker Installations

Docker installations are another avenue that allows for an easy and clean installation of the Superalgos Platform. While a little bit more technical than the packaged applications, it offers the ability to install the platform in a clean and isolated environment. 

You can find the official walk-through for docker installations in our [Docker Guide](Docker/README.md).

## Pros and Cons of Docker Installations

The main purpose of docker installations is for production instances.  This is because the Superalgos Platform will be installed in a nice and clean environment that can be controlled separately from the rest of your computer. This makes it a perfect candidate for users who wish to set up an instance of the platform to run dependably without interruption.

Being aimed at production, the standard docker installations are not a good option for users looking to contribute to the ecosystem. You will not be able to create a User Profile for the Governance system, submit a review, edit and translate the docs, or contribute code. 

## Unofficial Alternative

Traditional docker installations are not meant to be development environments. Meaning that you cannot submit a review, edit and translate the docs, or any kind of code contribution.  That being said, there is a little-used custom docker image that will allow you to install the platform in a development-compatible configuration.  You can find the image and a walk-through for installing it [on this page managed by a contributor](https://hub.docker.com/r/martinb78/superalgos-docker-develop).

This development-compatible docker installation is for special use cases. For example, using a local NAS to host the platform while still being able to add contributions. This is a nonstandard way of installing Superalgos and is only recommended for users who are comfortable using docker and dealing with potential pitfalls of installing using his method. 

> :white_check_mark: **IMPORTANT:** Please note that the development compatible docker image is not the standard method to install Superalgos for contributing. If you are new to contributing or are not an experienced developer, it is recommended that you follow the steps for a standard Developers and Contributor's installation instead (instructions available on the main README file.
