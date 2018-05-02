# Contribute Code or Provide Feedback

If you would like to become an active contributor to this project please follow the instructions provided in [Microsoft Azure Projects Contribution Guidelines](https://azure.github.io/guidelines/).

Look at issues in the repository labeled 'good first issue' to choose what'd you liked to jump into!

## Project Steup
The Azure Storage development team uses Visual Studio Code so instructions will be tailored to that preference. However, any preferred IDE or other toolset should be usable.

### Install
* Node v4 or above
* [Visual Studio Code](https://code.visualstudio.com/)

### Development Environment Setup
To get the source code of the SDK via **git** just type:

```bash
git clone https://github.com/Azure/azure-storage-node.git
cd ./azure-storage-node
```

Then, run NPM to install all the NPM dependencies:

```bash
npm install
```

## Tests

### Running
Unit tests don't require real credentials and don't require any environment variables to be set. By default the unit tests are run with Nock recording data.

If you would like to run the unit test against a live storage account, you will need to setup environment variables which will be used. These test will use these credentials to run live tests against Azure with the provided credentials. Note that you will be charged for storage usage. You need verify the clean up script did its job at the end of a test run.

Unit tests can then be run from root directory using:

```bash
npm test
```

To run unit tests against live storage accounts, please set environment variable to turn off Nock by:

```bash
export NOCK_OFF=true
```

and set up the following environment variables for storage account credentials by:

```bash
export AZURE_STORAGE_CONNECTION_STRING="valid storage connection string"
export AZURE_STORAGE_CONNECTION_STRING_PREMIUM_ACCOUNT="optional valid storage connection string for premium storage account"
export AZURE_STORAGE_CONNECTION_STRING_SSE_ENABLED_ACCOUNT="optional valid storage connection string for storage account with storage service encryption enabled"
```

Note: `AZURE_STORAGE_CONNECTION_STRING_PREMIUM_ACCOUNT` and `AZURE_STORAGE_CONNECTION_STRING_SSE_ENABLED_ACCOUNT` are optional settings to enable testing suites related to premium storage account and storage service encryption, and only needed to be set when you are developing related features.

### Testing Features
As you develop a feature, you'll need to write tests to ensure quality. Your changes should be covered by both unit tests. You should also run existing tests related to your change to address any unexpected breaks.

## Pull Requests

### Guidelines
The following are the minimum requirements for any pull request that must be met before contributions can be accepted.
* Make sure you've signed the [CLA](https://cla.azure.com/) before you start working on any change.
* Discuss any proposed contribution with the team via a GitHub issue **before** starting development.
* Code must be professional quality
  * No style issues
  * You should strive to mimic the style with which we have written the library
  * Clean, well-commented, well-designed code
  * Try to limit the number of commits for a feature to 1-2. If you end up having too many we may ask you to squash your changes into fewer commits.
* [ChangeLog.md](ChangeLog.md) needs to be updated describing the new change
* Thoroughly test your feature

### Branching Policy
Changes should be based on the **dev** branch, not master as master is considered publicly released code. Each breaking change should be recorded in [BreakingChanges.md](BreakingChanges.md).

### Adding Features for All Platforms
We strive to release each new feature for each of our environments at the same time. Therefore, we ask that all contributions be written for Node v4 and later.

### Review Process
We expect all guidelines to be met before accepting a pull request. As such, we will work with you to address issues we find by leaving comments in your code. Please understand that it may take a few iterations before the code is accepted as we maintain high standards on code quality. Once we feel comfortable with a contribution, we will validate the change and accept the pull request.

Thank you for any contributions! Please let the team know if you have any questions or concerns about our contribution policy.