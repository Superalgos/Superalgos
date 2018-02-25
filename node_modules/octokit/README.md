# octokit.js [![Build Status](https://travis-ci.org/philschatz/octokit.js.png)](https://travis-ci.org/philschatz/octokit.js)

octokit.js provides a minimal higher-level wrapper around git's [plumbing commands](http://git-scm.com/book/en/Git-Internals-Plumbing-and-Porcelain),
exposing an API for manipulating GitHub repositories, users, groups, and gists.
It is being developed in the context of [github-bookeditor](https://github.com/oerpub/github-bookeditor), an EPUB3 editor for GitHub.

This package can also be used in `nodejs` or as an AMD module in the browser.

## Key Features

- Works in `nodejs`, an AMD module in the browser, and as a [bower](https://github.com/bower/bower) library
- Simple `read` and `write` methods for text _and_ binary files
- Creating gists, Pull Requests, forks, and new Repositories
- `ETag` Caching
- Promises instead of callbacks (for better error-handling and progress updating)
- Progress Notifications for multistep operations
- Starring and Following repositories, users, and organizations
- Editing Team and Organization Membership
- User/Org/Repo events and notifications
- Listeners for rate limit changes
- Public Keys
- Hooks (commit, comment, etc)


## Usage

All asynchronous methods return a [Common-JS Promise](http://wiki.commonjs.org/wiki/Promises/A).

### In a browser without requirejs

Create an Octokit instance.

```js
var gh = new Octokit({
  username: "USER_NAME",
  password: "PASSWORD"
});
```

Or if you prefer OAuth, it looks like this:

```js
var gh = new Octokit({
  token: "OAUTH_TOKEN"
});
```

### In a browser using requirejs

```js
define(['octokit'], function(Octokit) {
  var gh = new Octokit({
    username: "YOU_USER",
    password: "YOUR_PASSWORD"
  });
});
```

### In NodeJS

Install instructions:

    npm install octokit --save

```js
var Octokit = require('octokit');
var gh = Octokit.new({
  username: "YOU_USER",
  password: "YOUR_PASSWORD"
});
```

### Using Generators in NodeJS 0.11 (or EcmaScript 6 browsers)

This requires NodeJS 0.11 with the `--harmony-generators` flag:

```js
var co = require('co');
var Octokit = require('octokit');
var gh = Octokit.new();

var fn = function *() {
  var zen  = yield gh.getZen();
  var info = yield gh.getRepo('philschatz', 'octokit.js').getInfo();

  console.log(zen);
  console.log(info);
};

co(fn)();
```

### Using bower

This file can be included using the bower package manager:

    bower install octokit --save

## Development

Mocha tests are run on NodeJS by running `npm test`. Mocha tests in the browser and code coverage are run by going to [./test/index.html](http://philschatz.github.io/octokit.js/test).


## Repository API


```js
var repo = gh.getRepo(username, reponame);
```

Show repository information

```js
repo.getInfo()
.then(function(repo) {})
```

List all branches in a Repository

```js
repo.getBranches()
.then(function(branches) {});
```

Fork a repository

```js
repo.fork()
.then(function() {});
```

Create a Pull Request

```js
repo.createPullRequest()
.then(function() {});
```

Get recent commits to the repository

```js
var options = {};
repo.getCommits(options)
.then(function(commits) {});
```

List Repository events

```js
repo.getEvents()
.then(function(events) {});
```

List Issue events for the repository

```js
repo.getIssueEvents()
.then(function(events) {});
```

List events for a network of Repositories

```js
repo.getNetworkEvents()
.then(function(events) {});
```

List unread notifications for authenticated user pertaining to this repository

```js
var options = {};
repo.getNotifications(options)
.then(function(events) {});
```

Get programming language counts (CoffeeScript, Ruby, Shell)

```js
repo.getLanguages()
.then(function(events) {});
```

Get releases
```js
repo.getReleases()
.then(function(releases) {});
```

### Branch API

Additional methods are available for a specific branch in a repository

Get the Default branch of a repository

```js
var branch = repo.getBranch();
```

Get a specific branch of a repository

```js
var branch = repo.getBranch("BRANCH_NAME");
```

Read a file from the branch

```js
var isBinary = false;
branch.read('PATH/TO/FILE.txt', isBinary)
.then(function(contents) {})
```

Remove a file from the branch

```js
var message = "OPTIONAL COMMIT MESSAGE";
branch.remove('PATH/TO/FILE.txt', message)
.then(function() {});
```

Read the contents (raw) of a file or directory

```js
branch.contents('DIRECTORY/PATH')
.then(function(contents) {});
```

or

```js
branch.contents('DIRECTORY/PATH/FILE.txt')
.then(function(contents) {});
```

Move a file

```js
var message = "OPTIONAL COMMIT MESSAGE";
branch.move('PATH/TO/FILE.txt', 'NEW/PATH/TO/FILE.txt', message)
.then(function() {});
```

Write a file (update or add)

```js
var content = "Contents of the file";
var message = "OPTIONAL COMMIT MESSAGE";
var isBinary = false;
branch.write('PATH/TO/FILE.txt', content, message, isBinary)
.then(function() {});
```

Write multiple files (update or add) in one commit

```js
var contents = {
  "FILE1.txt": "Contents of the file",
  "FILE2.txt": {isBase64: true, content: "BASE_64_ENCODED_STRING"}
}
branch.writeMany(contents, message)
.then(function() {});
```

Get recent commits to a branch

```js
var options = {};
branch.getCommits(options)
.then(function(commits) {});
```

Create a new branch

```js
branch.createBranch("new-branch-name")
.then(function() {});
```


### Low-level Repo API

The methods on a branch or repo use the following low-level methods.

```js
repo.git.getRef(...)      .then(function(result) {});
repo.git.createRef(...)   .then(function(result) {});
repo.git.deleteRef(...)   .then(function(result) {});
repo.git.getBranches()    .then(function(result) {});
repo.git.getBlob(...)     .then(function(result) {});
repo.git.getSha(...)      .then(function(result) {});
repo.git.getTree(...)     .then(function(result) {});
repo.git.postBlob(...)    .then(function(result) {});
repo.git.updateTree(...)  .then(function(result) {});
repo.git.postTree(...)    .then(function(result) {});
repo.git.commit(...)      .then(function(result) {});
repo.git.updateHead(...)  .then(function(result) {});
repo.git.getCommits(...)  .then(function(result) {});
```


## User API


```js
var user = gh.getUser(GITHUB_USERNAME);
```

Show user information for a particular user. Also works for organizations.

```js
user.getInfo()
.then(function(user) {})
```

List public repositories for a particular user.
_options described [here](http://developer.github.com/v3/repos/#list-user-repositories)_

```js
user.getRepos(type='all', sort='pushed', direction='desc')
.then(function(repos) {});
```

List organizations the user is in.

```js
user.getOrgs()
.then(function(orgs) {});
```

List all gists of a particular user.

```js
user.getGists()
.then(function(gists) {});
```

List users following this user.

```js
user.getFollowers()
.then(function(users) {});
```

List users this user is following.

```js
user.getFollowing()
.then(function(users) {});
```

Get Received events for this user.

```js
user.getReceivedEvents()
.then(function(events) {});
```

Get all events for this user.

```js
user.getEvents()
.then(function(events) {});
```


## Authenticated User API

The Authenticated User contains the following methods in addition to all the methods in the **User API**.

Get the authenticated user.

```js
var user = gh.getUser();
```

List unread notifications for the user.

```js
gh.getNotifications()
.then(function(notifications) {})
```

List private and public repositories of the current authenticated user.

```js
user.getRepos()
.then(function(repos) {});
```

Follow another user.

```js
user.follow("OTHER_USERNAME")
.then(function(orgs) {});
```

Stop following another user.

```js
user.unfollow("OTHER_USERNAME")
.then(function(orgs) {});
```


## Gist API

```js
var gist = gh.getGist(3165654);
```

Read the contents of a Gist.

```js
gist.read()
.then(function(gist) {});
```

Update the contents of a Gist. Please consult the documentation on [GitHub](http://developer.github.com/v3/gists/).

```js
var delta = {
  "description": "the description for this gist",
  "files": {
    "file1.txt": {
      "content": "updated file contents"
    },
    "old_name.txt": {
      "filename": "new_name.txt",
      "content": "modified contents"
    },
    "new_file.txt": {
      "content": "a new file"
    },
    "delete_this_file.txt": null
  }
};

gist.update(delta)
.then(function(gist) {});
```

Create a Gist

```js
var files = {
  'file1.txt': {content: 'String file contents'}
};

gh.getGist().create(files)
.then(function(gist) {});
```

Delete the Gist

```js
gist.delete()
.then(function(gist) {});
```

Fork the Gist

```js
gist.fork()
.then(function(gist) {});
```

Star the Gist

```js
gist.star()
.then(function() {});
```

Unstar the Gist

```js
gist.unstar()
.then(function() {});
```

Check if the Gist is starred

```js
gist.isStarred()
.then(function() {});
```


## Miscellaneous methods

Retreive a zen message (to test the API works).

```js
gh.getZen()
.then(function(msg) {});
```

Add a listener for `rateLimit` changes

```js
function listener(rateLimitRemaining, rateLimit, method, path, data, raw, isBase64) {
  // ...
};
gh.onRateLimitChanged(listener);
```

List repositories for a particular organization. Includes private repositories if you are authorized.

```js
gh.getOrgRepos(orgname)
.then(function(repos) {});
```

## Progress Notifications

For multistep operations users can listen to updates by registering a listener at `promise.progress(function(obj) {})`.



## Setup

`octokit.js` has the following dependencies when used in a browser:

- A Promise API (supports jQuery, AngularJS, or a Promise Polyfill)

If you are already using [jQuery](https://api.jquery.com/jQuery.Deferred/) or [AngularJS](https://docs.angularjs.org/api/ng/service/$q) in your project just be sure to include them before octokit and it will
use their Promise API.

Otherwise, you can include a Promise polyfill like [jakearchibald/es6-promise](https://github.com/jakearchibald/es6-promise):

```
<script src="./node_modules/es6-promise/dist/promise-0.1.1.js"></script>
<script src="./octokit.js">
```

## Change Log


### 0.7.X

Switched to a native `request` implementation (thanks @mattpass). Adds support for GitHub gists, forks and pull requests.

### 0.6.X

Adds support for organizations and fixes an encoding issue.

### 0.5.X

Smart caching of latest commit sha.

### 0.4.X

Added support for [OAuth](http://developer.github.com/v3/oauth/).

### 0.3.X

Support for Moving and removing files.

### 0.2.X

Consider commit messages.

### 0.1.X

Initial version.
