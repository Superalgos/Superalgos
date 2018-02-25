# Github Promise API
# ======
#
# This class provides a Promise API for accessing GitHub.
# Most methods return a Promise object whose value is resolved when `.then(doneFn, failFn)`
# is called.
#

# Based on Github.js 0.7.0
#
#     (c) 2012 Michael Aufreiter, Development Seed
#     Github.js is freely distributable under the MIT license.
#     For all details and documentation:
#     http://substance.io/michael/github


# Underscore shim
# =========
#
# The following code is a shim for the underscore.js functions this code relise on

_ = {}

_.isEmpty = (object) ->
  Object.keys(object).length == 0

_.isArray = Array.isArray or (obj) ->
  toString.call(obj) is'[object Array]'

_.defaults = (object, values) ->
  for key in Object.keys(values)
    do (key) ->
      object[key] ?= values[key]

_.each = (object, fn) ->
  return if not object
  if _.isArray(object)
    object.forEach(fn)
  arr = []
  for key in Object.keys(object)
    do (key) ->
      fn(object[key])

_.pairs = (object) ->
  arr = []
  for key in Object.keys(object)
    do (key) ->
      arr.push([key, object[key]])
  return arr

_.map = (object, fn) ->
  if _.isArray(object)
    return object.map(fn)
  arr = []
  for key in Object.keys(object)
    do (key) ->
      arr.push(fn(object[key]))
  arr

_.last = (object, n) ->
  len = object.length
  object.slice(len - n, len)

_.select = (object, fn) ->
  object.filter(fn)

_.extend = (object, template) ->
  for key in Object.keys(template)
    do (key) ->
      object[key] = template[key]
  object

_.toArray = (object) ->
  return Array.prototype.slice.call(object)



# Generate a Github class
# =========
#
# Depending on how this is loaded (nodejs, requirejs, globals)
# the actual underscore, jQuery.ajax/Deferred, and base64 encode functions may differ.
makeOctokit = (newPromise, allPromises, XMLHttpRequest, base64encode, userAgent) =>

  # Simple jQuery.ajax() shim that returns a promise for a xhr object
  ajax = (options) ->
    return newPromise (resolve, reject) ->

      xhr = new XMLHttpRequest()
      xhr.dataType = options.dataType
      xhr.overrideMimeType?(options.mimeType)
      xhr.open(options.type, options.url)

      if options.data and 'GET' != options.type
        xhr.setRequestHeader('Content-Type', options.contentType)

      for name, value of options.headers
        xhr.setRequestHeader(name, value)

      xhr.onreadystatechange = () ->
        if 4 == xhr.readyState
          options.statusCode?[xhr.status]?()

          if xhr.status >= 200 and xhr.status < 300 or xhr.status == 304
            resolve(xhr)
          else
            reject(xhr)
      xhr.send(options.data)


  # Returns an always-resolved promise (like `Promise.resolve(val)` )
  resolvedPromise = (val) ->
    return newPromise (resolve, reject) -> resolve(val)

  # Returns an always-rejected promise (like `Promise.reject(err)` )
  rejectedPromise = (err) ->
    return newPromise (resolve, reject) -> reject(err)


  class Octokit

    constructor: (clientOptions={}) ->
      # Provide an option to override the default URL
      _.defaults clientOptions,
        rootURL: 'https://api.github.com'
        useETags: true
        usePostInsteadOfPatch: false

      _client = @ # Useful for other classes (like Repo) to get the current Client object

      # These are updated whenever a request is made
      _listeners = []

      # To support ETag caching cache the responses.
      class ETagResponse
        constructor: (@eTag, @data, @status) ->

      # Cached responses are stored in this object keyed by `path`
      _cachedETags = {}

      # Send simple progress notifications
      notifyStart = (promise, path) -> promise.notify? {type:'start', path:path}
      notifyEnd   = (promise, path) -> promise.notify? {type:'end',   path:path}

      # HTTP Request Abstraction
      # =======
      #
      _request = (method, path, data, options={raw:false, isBase64:false, isBoolean:false}) ->

        if 'PATCH' == method and clientOptions.usePostInsteadOfPatch
          method = 'POST'

        # Only prefix the path when it does not begin with http.
        # This is so pagination works (which provides absolute URLs).
        path = "#{clientOptions.rootURL}#{path}" if not /^http/.test(path)

        # Support binary data by overriding the response mimeType
        mimeType = undefined
        mimeType = 'text/plain; charset=x-user-defined' if options.isBase64

        headers = {
          'Accept': 'application/vnd.github.raw'
        }

        # Set the `User-Agent` because it is required and NodeJS
        # does not send one by default.
        # See http://developer.github.com/v3/#user-agent-required
        headers['User-Agent'] = userAgent if userAgent

        # Send the ETag if re-requesting a URL
        if path of _cachedETags
          headers['If-None-Match'] = _cachedETags[path].eTag
        else
          # The browser will sneak in a 'If-Modified-Since' header if the GET has been requested before
          # but for some reason the cached response does not seem to be available
          # in the jqXHR object.
          # So, the first time a URL is requested set this date to 0 so we always get a response the 1st time
          # a URL is requested.
          headers['If-Modified-Since'] = 'Thu, 01 Jan 1970 00:00:00 GMT'


        if (clientOptions.token) or (clientOptions.username and clientOptions.password)
          if clientOptions.token
            auth = "token #{clientOptions.token}"
          else
            auth = 'Basic ' + base64encode("#{clientOptions.username}:#{clientOptions.password}")
          headers['Authorization'] = auth


        promise = newPromise (resolve, reject) ->

          ajaxConfig =
            # Be sure to **not** blow the cache with a random number
            # (GitHub will respond with 5xx or CORS errors)
            url: path
            type: method
            contentType: 'application/json'
            mimeType: mimeType
            headers: headers

            processData: false # Don't convert to QueryString
            data: !options.raw and data and JSON.stringify(data) or data
            dataType: 'json' unless options.raw

          # If the request is a boolean yes/no question GitHub will indicate
          # via the HTTP Status of 204 (No Content) or 404 instead of a 200.
          if options.isBoolean
            ajaxConfig.statusCode =
              # a Boolean 'yes'
              204: () => resolve(true)
              # a Boolean 'no'
              404: () => resolve(false)

          xhrPromise = ajax(ajaxConfig)

          always = (jqXHR) =>
            notifyEnd(@, path)
            # Fire listeners when the request completes or fails
            rateLimit = parseFloat(jqXHR.getResponseHeader 'X-RateLimit-Limit')
            rateLimitRemaining = parseFloat(jqXHR.getResponseHeader 'X-RateLimit-Remaining')

            for listener in _listeners
              listener(rateLimitRemaining, rateLimit, method, path, data, options)


          # Return the result and Base64 encode it if `options.isBase64` flag is set.
          xhrPromise.then (jqXHR) ->
            always(jqXHR)

            # If the response was a 304 then return the cached version
            if 304 == jqXHR.status
              if clientOptions.useETags and _cachedETags[path]
                eTagResponse = _cachedETags[path]

                resolve(eTagResponse.data, eTagResponse.status, jqXHR)
              else
                resolve(jqXHR.responseText, status, jqXHR)

            # If it was a boolean question and the server responded with 204
            # return true.
            else if 204 == jqXHR.status and options.isBoolean
              resolve(true, status, jqXHR)

            else


              if jqXHR.responseText and 'json' == ajaxConfig.dataType
                data = JSON.parse(jqXHR.responseText)

                # Only JSON responses have next/prev/first/last link headers
                # Add them to data so the resolved value is iterable
                valOptions = {}

                # Parse the Link headers
                # of the form `<http://a.com>; rel="next", <https://b.com?a=b&c=d>; rel="previous"`
                links = jqXHR.getResponseHeader('Link')
                _.each links?.split(','), (part) ->
                  [discard, href, rel] = part.match(/<([^>]+)>;\ rel="([^"]+)"/)
                  # Name the functions `nextPage`, `previousPage`, `firstPage`, `lastPage`
                  valOptions["#{rel}Page"] = () -> _request('GET', href, null, options)

                # Add the pagination functions on the JSON since Promises resolve one value
                _.extend(data, valOptions)

              else
                data = jqXHR.responseText

              # Convert the response to a Base64 encoded string
              if 'GET' == method and options.isBase64
                # Convert raw data to binary chopping off the higher-order bytes in each char.
                # Useful for Base64 encoding.
                converted = ''
                for i in [0..data.length]
                  converted += String.fromCharCode(data.charCodeAt(i) & 0xff)

                data = converted

              # Cache the response to reuse later
              if 'GET' == method and jqXHR.getResponseHeader('ETag') and clientOptions.useETags
                eTag = jqXHR.getResponseHeader('ETag')
                _cachedETags[path] = new ETagResponse(eTag, data, jqXHR.status)

              resolve(data, jqXHR.status, jqXHR)

          # Parse the error if one occurs
          onError = (jqXHR) ->
            always(jqXHR)

            # If the request was for a Boolean then a 404 should be treated as a "false"
            if options.isBoolean and 404 == jqXHR.status
              resolve(false)

            else

              if jqXHR.getResponseHeader('Content-Type') != 'application/json; charset=utf-8'
                err = new Error(jqXHR.responseText)
                err['status'] = jqXHR.status
                err['__jqXHR'] = jqXHR
                reject(err)

              else
                err = new Error("Github error: #{jqXHR.responseText}")
                if jqXHR.responseText
                  json = JSON.parse(jqXHR.responseText)
                else
                  # In the case of 404 errors, `responseText` is an empty string
                  json = ''
                # XXX: should be body or something else probably
                err['error'] = json
                err['status'] = jqXHR.status
                err['__jqXHR'] = jqXHR
                reject(err)

          # Depending on the Promise implementation, the `catch` method may be `.catch` or `.fail`
          xhrPromise.catch?(onError) or xhrPromise.fail(onError)

        notifyStart(promise, path)
        # Return the promise
        return promise


      # Converts a dictionary to a query string.
      # Internal helper method
      toQueryString = (options) ->

        # Returns '' if `options` is empty so this string can always be appended to a URL
        return '' if _.isEmpty(options)

        params = []
        _.each _.pairs(options), ([key, value]) ->
          params.push "#{key}=#{encodeURIComponent(value)}"
        return "?#{params.join('&')}"

      # Clear the local cache
      # -------
      @clearCache = clearCache = () -> _cachedETags = {}

      ## Get the local cache
      # -------
      @getCache = getCache = () -> _cachedETags

      ## Set the local cache
      # -------
      @setCache = setCache = (cachedETags) ->
        # check if argument is valid.
        unless cachedETags != null and typeof cachedETags == 'object'
          throw new Error 'BUG: argument of method "setCache" should be an object'

        else
          _cachedETags = cachedETags

      # Add a listener that fires when the `rateLimitRemaining` changes as a result of
      # communicating with github.
      @onRateLimitChanged = (listener) ->
        _listeners.push listener

      # Random zen quote (test the API)
      # -------
      @getZen = () ->
        # Send `data` to `null` and the `raw` flag to `true`
        _request 'GET', '/zen', null, {raw:true}

      # Get all users
      # -------
      @getAllUsers = (since=null) ->
        options = {}
        options.since = since if since
        _request 'GET', '/users', options

      # List public repositories for an Organization
      # -------
      @getOrgRepos = (orgName, type='all') ->
        _request 'GET', "/orgs/#{orgName}/repos?type=#{type}&per_page=1000&sort=updated&direction=desc", null

      # Get public Gists on all of GitHub
      # -------
      @getPublicGists = (since=null) ->
        options = null
        # Converts a Date object to a string
        getDate = (time) ->
          return time.toISOString() if Date == time.constructor
          return time

        options = {since: getDate(since)} if since
        _request 'GET', '/gists/public', options

      # List Public Events on all of GitHub
      # -------
      @getPublicEvents = () ->
        _request 'GET', '/events', null


      # List unread notifications for authenticated user
      # -------
      # Optional arguments:
      #
      # - `all`: `true` to show notifications marked as read.
      # - `participating`: `true` to show only notifications in which the user is directly participating or mentioned.
      # - `since`: Optional time.
      @getNotifications = (options={}) ->
        # Converts a Date object to a string
        getDate = (time) ->
          return time.toISOString() if Date == time.constructor
          return time

        options.since = getDate(options.since) if options.since

        queryString = toQueryString(options)
        _request 'GET', "/notifications#{queryString}", null


      # Github Users API
      # =======
      class User

        # Store the username
        constructor: (_username=null) ->

          # Private var that stores the root path.
          # Use a different URL if this user is the authenticated user
          if _username
            _rootPath = "/users/#{_username}"
          else
            _rootPath = "/user"

          # Retrieve user information
          # -------
          _cachedInfo = null
          @getInfo = (force=false) ->
            _cachedInfo = null if force

            if _cachedInfo
              return resolvedPromise(_cachedInfo)

            _request('GET', "#{_rootPath}", null)
            # Squirrel away the user info
            .then (info) -> _cachedInfo = info

          # List user repositories
          # -------
          @getRepos = (type='all', sort='pushed', direction='desc') ->
            _request 'GET', "#{_rootPath}/repos?type=#{type}&per_page=1000&sort=#{sort}&direction=#{direction}", null

          # List user organizations
          # -------
          @getOrgs = () ->
            _request 'GET', "#{_rootPath}/orgs", null

          # List a user's gists
          # -------
          @getGists = () ->
            _request 'GET', "#{_rootPath}/gists", null

          # List followers of a user
          # -------
          @getFollowers = () ->
            _request 'GET', "#{_rootPath}/followers", null

          # List who this user is following
          # -------
          @getFollowing = () ->
            _request 'GET', "#{_rootPath}/following", null

          # Check if this user is following another user
          # -------
          @isFollowing = (user) ->
            _request 'GET', "#{_rootPath}/following/#{user}", null, {isBoolean:true}

          # List public keys for a user
          # -------
          @getPublicKeys = () ->
            _request 'GET', "#{_rootPath}/keys", null


          # Get Received events for this user
          # -------
          @getReceivedEvents = (onlyPublic) ->
            throw new Error 'BUG: This does not work for authenticated users yet!' if not _username
            isPublic = ''
            isPublic = '/public' if onlyPublic
            _request 'GET', "/users/#{_username}/received_events#{isPublic}", null

          # Get all events for this user
          # -------
          @getEvents = (onlyPublic) ->
            throw new Error 'BUG: This does not work for authenticated users yet!' if not _username
            isPublic = ''
            isPublic = '/public' if onlyPublic
            _request 'GET', "/users/#{_username}/events#{isPublic}", null

      # Authenticated User API
      # =======
      class AuthenticatedUser extends User

        constructor: () ->
          super()

          # Update the authenticated user
          # -------
          #
          # Valid options:
          # - `name`: String
          # - `email` : Publicly visible email address
          # - `blog`: String
          # - `company`: String
          # - `location`: String
          # - `hireable`: Boolean
          # - `bio`: String
          @updateInfo = (options) ->
            _request 'PATCH', '/user', options

          # List authenticated user's gists
          # -------
          @getGists = () ->
            _request 'GET', '/gists', null

          # Follow a user
          # -------
          @follow = (username) ->
            _request 'PUT', "/user/following/#{username}", null

          # Unfollow user
          # -------
          @unfollow = (username) ->
            _request 'DELETE', "/user/following/#{username}", null

          # Get Emails associated with this user
          # -------
          @getEmails = () ->
            _request 'GET', '/user/emails', null

          # Add Emails associated with this user
          # -------
          @addEmail = (emails) ->
            emails = [emails] if !_.isArray(emails)
            _request 'POST', '/user/emails', emails

          # Remove Emails associated with this user
          # -------
          @addEmail = (emails) ->
            emails = [emails] if !_.isArray(emails)
            _request 'DELETE', '/user/emails', emails

          # Get a single public key
          # -------
          @getPublicKey = (id) ->
            _request 'GET', "/user/keys/#{id}", null

          # Add a public key
          # -------
          @addPublicKey = (title, key) ->
            _request 'POST', "/user/keys", {title: title, key: key}

          # Update a public key
          # -------
          @updatePublicKey = (id, options) ->
            _request 'PATCH', "/user/keys/#{id}", options

          # Create a repository
          # -------
          #
          # Optional parameters:
          # - `description`: String
          # - `homepage`: String
          # - `private`: boolean (Default `false`)
          # - `has_issues`: boolean (Default `true`)
          # - `has_wiki`: boolean (Default `true`)
          # - `has_downloads`: boolean (Default `true`)
          # - `auto_init`:  boolean (Default `false`)
          @createRepo = (name, options={}) ->
            options.name = name
            _request 'POST', "/user/repos", options

          # Get Received events for this authenticated user
          # -------
          @getReceivedEvents = (username, page = 1) ->
            currentPage = '?page=' + page
            _request 'GET', '/users/' + username + '/received_events' + currentPage, null

          @getStars = () ->
            _request 'GET', "/user/starred"

          @putStar = (owner, repo) ->
            _request 'PUT', "/user/starred/#{owner}/#{repo}"

          @deleteStar = (owner, repo) ->
            _request 'DELETE', "/user/starred/#{owner}/#{repo}"


      # Organization API
      # =======

      class Team
        constructor: (@id) ->
          @getInfo = () ->
            _request 'GET', "/teams/#{@id}", null

          # - `name`
          # - `permission`
          @updateTeam = (options) ->
            _request 'PATCH', "/teams/#{@id}", options

          @remove = () ->
            _request 'DELETE', "/teams/#{@id}"

          @getMembers = () ->
            _request 'GET', "/teams/#{@id}/members"

          @isMember = (user) ->
            _request 'GET', "/teams/#{@id}/members/#{user}", null, {isBoolean:true}

          @addMember = (user) ->
            _request 'PUT', "/teams/#{@id}/members/#{user}"

          @removeMember = (user) ->
            _request 'DELETE', "/teams/#{@id}/members/#{user}"

          @getRepos = () ->
            _request 'GET', "/teams/#{@id}/repos"

          @addRepo = (orgName, repoName) ->
            _request 'PUT', "/teams/#{@id}/repos/#{orgName}/#{repoName}"

          @removeRepo = (orgName, repoName) ->
            _request 'DELETE', "/teams/#{@id}/repos/#{orgName}/#{repoName}"


      class Organization
        constructor: (@name) ->

          @getInfo = () ->
            _request 'GET', "/orgs/#{@name}", null

          # - `billing_email`: Billing email address. This address is not publicized.
          # - `company`
          # - `email`
          # - `location`
          # - `name`
          @updateInfo = (options) ->
            _request 'PATCH', "/orgs/#{@name}", options

          @getTeams = () ->
            _request 'GET', "/orgs/#{@name}/teams", null

          # `permission` can be one of `pull`, `push`, or `admin`
          @createTeam = (name, repoNames=null, permission='pull') ->
            options = {name: name, permission: permission}
            options.repo_names = repoNames if repoNames
            _request 'POST', "/orgs/#{@name}/teams", options

          @getMembers = () ->
            _request 'GET', "/orgs/#{@name}/members", null

          @isMember = (user) ->
            _request 'GET', "/orgs/#{@name}/members/#{user}", null, {isBoolean:true}

          @removeMember = (user) ->
            _request 'DELETE', "/orgs/#{@name}/members/#{user}", null

          # Create a repository
          # -------
          #
          # Optional parameters are the same as `.getUser().createRepo()` with one addition:
          # - `team_id`:  number
          @createRepo = (name, options={}) ->
            options.name = name
            _request 'POST', "/orgs/#{@name}/repos", options


          # List repos for an organisation
          # -------
          @getRepos = () ->
            _request 'GET', "/orgs/#{@name}/repos?type=all", null


      # Repository API
      # =======

      # Low-level class for manipulating a Git Repository
      # -------
      class GitRepo

        constructor: (@repoUser, @repoName) ->
          _repoPath = "/repos/#{@repoUser}/#{@repoName}"

          # Delete this Repository
          # -------
          # **Note:** This is here instead of on the `Repository` object
          # so it is less likely to accidentally be used.
          @deleteRepo = () ->
            _request 'DELETE', "#{_repoPath}"

          # Uses the cache if branch has not been changed
          # -------
          @_updateTree = (branch) ->
            @getRef("heads/#{branch}")


          # Get a particular reference
          # -------
          @getRef = (ref) ->
            _request('GET', "#{_repoPath}/git/refs/#{ref}", null)
            .then (res) =>
              return res.object.sha


          # Create a new reference
          # --------
          #
          #     {
          #       "ref": "refs/heads/my-new-branch-name",
          #       "sha": "827efc6d56897b048c772eb4087f854f46256132"
          #     }
          @createRef = (options) ->
            _request 'POST', "#{_repoPath}/git/refs", options


          # Delete a reference
          # --------
          #
          #     repo.deleteRef('heads/gh-pages')
          #     repo.deleteRef('tags/v1.0')
          @deleteRef = (ref) ->
            _request 'DELETE', "#{_repoPath}/git/refs/#{ref}", @options


          # List all branches of a repository
          # -------
          @getBranches = () ->
            _request('GET', "#{_repoPath}/git/refs/heads", null)
            .then (heads) =>
              return _.map(heads, (head) ->
                _.last head.ref.split("/")
              )


          # Retrieve the contents of a blob
          # -------
          @getBlob = (sha, isBase64) ->
            _request 'GET', "#{_repoPath}/git/blobs/#{sha}", null, {raw:true, isBase64:isBase64}


          # For a given file path, get the corresponding sha (blob for files, tree for dirs)
          # -------
          @getSha = (branch, path) ->
            # Just use head if path is empty
            return @getRef("heads/#{branch}") if path is ''

            @getTree(branch, {recursive:true})
            .then (tree) =>
              file = _.select(tree, (file) ->
                file.path is path
              )[0]
              return file?.sha if file?.sha

              # Return a promise that has failed if no sha was found
              return rejectedPromise {message: 'SHA_NOT_FOUND'}


          # Get contents (file/dir)
          # -------
          @getContents = (path, sha=null) ->
            queryString = ''
            if sha != null
              queryString = toQueryString({ref:sha})
            _request('GET', "#{_repoPath}/contents/#{path}#{queryString}", null, {raw:true})
            .then (contents) =>
              return contents


          # Remove a file from the tree
          # -------
          @removeFile = (path, message, sha, branch) ->
            params =
              message: message
              sha: sha
              branch: branch
            _request 'DELETE', "#{_repoPath}/contents/#{path}", params, null


          # Retrieve the tree a commit points to
          # -------
          # Optionally set recursive to true
          @getTree = (tree, options=null) ->
            queryString = toQueryString(options)
            _request('GET', "#{_repoPath}/git/trees/#{tree}#{queryString}", null)
            .then (res) =>
              return res.tree


          # Post a new blob object, getting a blob SHA back
          # -------
          @postBlob = (content, isBase64) ->
            if typeof (content) is 'string'
              # Base64 encode the content if it is binary (isBase64)
              content = base64encode(content) if isBase64

              content =
                content: content
                encoding: 'utf-8'

            content.encoding = 'base64' if isBase64

            _request('POST', "#{_repoPath}/git/blobs", content)
            .then (res) =>
              return res.sha


          # Update an existing tree adding a new blob object getting a tree SHA back
          # -------
          # `newTree` is of the form:
          #
          #     [ {
          #       path: path
          #       mode: '100644'
          #       type: 'blob'
          #       sha: blob
          #     } ]
          @updateTreeMany = (baseTree, newTree) ->
            data =
              base_tree: baseTree
              tree: newTree

            _request('POST', "#{_repoPath}/git/trees", data)
            .then (res) =>
              return res.sha


          # Post a new tree object having a file path pointer replaced
          # with a new blob SHA getting a tree SHA back
          # -------
          @postTree = (tree) ->
            _request('POST', "#{_repoPath}/git/trees", {tree: tree})
            .then (res) =>
              return res.sha


          # Create a new commit object with the current commit SHA as the parent
          # and the new tree SHA, getting a commit SHA back
          # -------
          @commit = (parents, tree, message) ->
            parents = [parents] if not _.isArray(parents)
            data =
              message: message
              parents: parents
              tree: tree

            _request('POST', "#{_repoPath}/git/commits", data)
            .then((commit) -> return commit.sha)


          # Update the reference of your head to point to the new commit SHA
          # -------
          @updateHead = (head, commit, force=false) ->
            options = {sha:commit}
            options.force = true if force
            _request 'PATCH', "#{_repoPath}/git/refs/heads/#{head}", options


          # Get a single commit
          # --------------------
          @getCommit = (sha) ->
            _request('GET', "#{_repoPath}/commits/#{sha}", null)

          # List commits on a repository.
          # -------
          # Takes an object of optional paramaters:
          #
          # - `sha`: SHA or branch to start listing commits from
          # - `path`: Only commits containing this file path will be returned
          # - `author`: GitHub login, name, or email by which to filter by commit author
          # - `since`: ISO 8601 date - only commits after this date will be returned
          # - `until`: ISO 8601 date - only commits before this date will be returned
          @getCommits = (options={}) ->
            options = _.extend {}, options

            # Converts a Date object to a string
            getDate = (time) ->
              return time.toISOString() if Date == time.constructor
              return time

            options.since = getDate(options.since) if options.since
            options.until = getDate(options.until) if options.until

            queryString = toQueryString(options)

            _request('GET', "#{_repoPath}/commits#{queryString}", null)


      # Branch Class
      # -------
      # Provides common methods that may require several git operations.
      class Branch

        constructor: (git, getRef) ->
          # Private variables
          _git = git
          _getRef = getRef or -> throw new Error 'BUG: No way to fetch branch ref!'

          # Get a single commit
          # --------------------
          @getCommit = (sha) -> _git.getCommit(sha)

          # List commits on a branch.
          # -------
          # Takes an object of optional paramaters:
          #
          # - `path`: Only commits containing this file path will be returned
          # - `author`: GitHub login, name, or email by which to filter by commit author
          # - `since`: ISO 8601 date - only commits after this date will be returned
          # - `until`: ISO 8601 date - only commits before this date will be returned
          @getCommits = (options={}) ->
            options = _.extend {}, options
            # Limit to the current branch
            _getRef()
            .then (branch) ->
              options.sha = branch
              _git.getCommits(options)



          # Creates a new branch based on the current reference of this branch
          # -------
          @createBranch = (newBranchName) ->
            _getRef()
            .then (branch) =>
              _git.getSha(branch, '')
              .then (sha) =>
                _git.createRef({sha:sha, ref:"refs/heads/#{newBranchName}"})



          # Read file at given path
          # -------
          # Set `isBase64=true` to get back a base64 encoded binary file
          @read = (path, isBase64) ->
            _getRef()
            .then (branch) =>
              _git.getSha(branch, path)
              .then (sha) =>
                _git.getBlob(sha, isBase64)
                # Return both the commit hash and the content
                .then (bytes) =>
                  return {sha:sha, content:bytes}


          # Get contents at given path
          # -------
          @contents = (path) ->
            _getRef()
            .then (branch) =>
              _git.getSha(branch, '')
              .then (sha) =>
                _git.getContents(path, sha)
                .then (contents) =>
                  return contents


          # Remove a file from the tree
          # -------
          # Optionally provide the sha of the file so it is not accidentally
          # deleted if the repo has changed in the meantime.
          @remove = (path, message="Removed #{path}", sha=null) ->
            _getRef()
            .then (branch) =>
              if sha
                _git.removeFile(path, message, sha, branch)
              else
                _git.getSha(branch, path)
                .then (sha) =>
                  _git.removeFile(path, message, sha, branch)



          # Move a file to a new location
          # -------
          @move = (path, newPath, message="Moved #{path}") ->
            _getRef()
            .then (branch) =>
              _git._updateTree(branch)
              .then (latestCommit) =>
                _git.getTree(latestCommit, {recursive:true})
                .then (tree) => # Update Tree
                  _.each tree, (ref) ->
                    ref.path = newPath  if ref.path is path
                    delete ref.sha  if ref.type is 'tree'

                  _git.postTree(tree)
                  .then (rootTree) =>
                    _git.commit(latestCommit, rootTree, message)
                    .then (commit) =>
                      _git.updateHead(branch, commit)
                      .then (res) =>
                        return res # Finally, return the result


          # Write file contents to a given branch and path
          # -------
          # To write base64 encoded data set `isBase64==true`
          #
          # Optionally takes a `parentCommitSha` which will be used as the
          # parent of this commit
          @write = (path, content, message="Changed #{path}", isBase64, parentCommitSha=null) ->
            contents = {}
            contents[path] =
              content: content
              isBase64: isBase64

            @writeMany(contents, message, parentCommitSha)


          # Write the contents of multiple files to a given branch
          # -------
          # Each file can also be binary.
          #
          # In general `contents` is a map where the key is the path and the value is `{content:'Hello World!', isBase64:false}`.
          # In the case of non-base64 encoded files the value may be a string instead.
          #
          # Example:
          #
          #     contents = {
          #       'hello.txt':          'Hello World!',
          #       'path/to/hello2.txt': { content: 'Ahoy!', isBase64: false}
          #     }
          #
          # Optionally takes an array of `parentCommitShas` which will be used as the
          # parents of this commit.
          @writeMany = (contents, message="Changed Multiple", parentCommitShas=null) ->
            # This method:
            #
            # 0. Finds the latest commit if one is not provided
            # 1. Asynchronously send new blobs for each file
            # 2. Use the return of the new Blob Post to return an entry in the new Commit Tree
            # 3. Wait on all the new blobs to finish
            # 4. Commit and update the branch
            _getRef()
            .then (branch) => # See below for Step 0.
              afterParentCommitShas = (parentCommitShas) => # 1. Asynchronously send all the files as new blobs.
                promises = _.map _.pairs(contents), ([path, data]) ->
                  # `data` can be an object or a string.
                  # If it is a string assume isBase64 is false and the string is the content
                  content = data.content or data
                  isBase64 = data.isBase64 or false
                  _git.postBlob(content, isBase64)
                  .then (blob) => # 2. return an entry in the new Commit Tree
                    return {
                      path: path
                      mode: '100644'
                      type: 'blob'
                      sha: blob
                    }
                # 3. Wait on all the new blobs to finish
                # Different Promise APIs implement this differently. For example:
                # - Promise uses `Promise.all([...])`
                # - jQuery uses `jQuery.when(p1, p2, p3, ...)`
                allPromises(promises)
                .then (newTrees) =>
                  _git.updateTreeMany(parentCommitShas, newTrees)
                  .then (tree) => # 4. Commit and update the branch
                    _git.commit(parentCommitShas, tree, message)
                    .then (commitSha) =>
                      _git.updateHead(branch, commitSha)
                      .then (res) => # Finally, return the result
                        return res.object # Return something that has a `.sha` to match the signature for read

              # 0. Finds the latest commit if one is not provided
              if parentCommitShas
                return afterParentCommitShas(parentCommitShas)
              else
                return _git._updateTree(branch).then(afterParentCommitShas)



      # Repository Class
      # -------
      # Provides methods for operating on the entire repository
      # and ways to operate on a `Branch`.
      class Repository

        constructor: (@options) ->
          # Private fields
          _user = @options.user
          _repo = @options.name

          # Set the `git` instance variable
          @git = new GitRepo(_user, _repo)
          @repoPath = "/repos/#{_user}/#{_repo}"
          @currentTree =
            branch: null
            sha: null


          @updateInfo = (options) ->
            _request 'PATCH', @repoPath, options


          # List all branches of a repository
          # -------
          @getBranches = () -> @git.getBranches()


          # Get a branch of a repository
          # -------
          @getBranch = (branchName=null) ->
            if branchName
              getRef = () =>
                return resolvedPromise(branchName)
              return new Branch(@git, getRef)
            else
              return @getDefaultBranch()


          # Get the default branch of a repository
          # -------
          @getDefaultBranch = () ->
            # Calls getInfo() to get the default branch name
            getRef = =>
              @getInfo()
              .then (info) =>
                return info.default_branch
            new Branch(@git, getRef)


          @setDefaultBranch = (branchName) ->
            @updateInfo {name: _repo, default_branch: branchName}


          # Get repository information
          # -------
          @getInfo = () ->
            _request 'GET', @repoPath, null

          # Get contents
          # --------
          @getContents = (branch, path) ->
            _request 'GET', "#{@repoPath}/contents?ref=#{branch}", {path: path}


          # Fork repository
          # -------
          @fork = (organization) ->
            if organization
              _request 'POST', "#{@repoPath}/forks",
                organization: organization
            else
              _request 'POST', "#{@repoPath}/forks", null


          # Create pull request
          # --------
          @createPullRequest = (options) ->
            _request 'POST', "#{@repoPath}/pulls", options


          # Get recent commits to the repository
          # --------
          # Takes an object of optional paramaters:
          #
          # - `path`: Only commits containing this file path will be returned
          # - `author`: GitHub login, name, or email by which to filter by commit author
          # - `since`: ISO 8601 date - only commits after this date will be returned
          # - `until`: ISO 8601 date - only commits before this date will be returned
          @getCommits = (options) ->
            @git.getCommits(options)


          # List repository events
          # -------
          @getEvents = () ->
            _request 'GET', "#{@repoPath}/events", null

          # List Issue events for a Repository
          # -------
          @getIssueEvents = () ->
            _request 'GET', "#{@repoPath}/issues/events", null

          # List events for a network of Repositories
          # -------
          @getNetworkEvents = () ->
            _request 'GET', "/networks/#{_user}/#{_repo}/events", null


          # List unread notifications for authenticated user
          # -------
          # Optional arguments:
          #
          # - `all`: `true` to show notifications marked as read.
          # - `participating`: `true` to show only notifications in which
          #   the user is directly participating or mentioned.
          # - `since`: Optional time.
          @getNotifications = (options={}) ->
            # Converts a Date object to a string
            getDate = (time) ->
              return time.toISOString() if Date == time.constructor
              return time

            options.since = getDate(options.since) if options.since

            queryString = toQueryString(options)

            _request 'GET', "#{@repoPath}/notifications#{queryString}", null

          # List Collaborators
          # -------
          # When authenticating as an organization owner of an
          # organization-owned repository, all organization owners
          # are included in the list of collaborators.
          # Otherwise, only users with access to the repository are
          # returned in the collaborators list.
          @getCollaborators = () ->
            _request 'GET', "#{@repoPath}/collaborators", null

          @addCollaborator = (username) ->
            throw new Error 'BUG: username is required' if not username
            _request 'PUT', "#{@repoPath}/collaborators/#{username}", null, {isBoolean:true}

          @removeCollaborator = (username) ->
            throw new Error 'BUG: username is required' if not username
            _request 'DELETE', "#{@repoPath}/collaborators/#{username}", null, {isBoolean:true}

          @isCollaborator = (username=null) ->
            throw new Error 'BUG: username is required' if not username
            _request 'GET', "#{@repoPath}/collaborators/#{username}", null, {isBoolean:true}

          # Can Collaborate
          # -------
          # True if the authenticated user has permission
          # to commit to this repository.
          @canCollaborate = () ->
            # Short-circuit if no credentials provided
            if not (clientOptions.password or clientOptions.token)
              return resolvedPromise(false)

            _client.getLogin()
            .then (login) =>
              if not login
                return false
              else
                return @isCollaborator(login)
            .then null, (err) =>
              # Problem logging in (maybe bad username/password)
              return false


          # List all hooks
          # -------
          @getHooks = () ->
            _request 'GET', "#{@repoPath}/hooks", null

          # Get single hook
          # -------
          @getHook = (id) ->
            _request 'GET', "#{@repoPath}/hooks/#{id}", null

          # Create a new hook
          # -------
          #
          # - `name` (Required string) : The name of the service that is being called.
          #         (See /hooks for the list of valid hook names.)
          # - `config` (Required hash) : A Hash containing key/value pairs to provide settings for this hook.
          #                              These settings vary between the services and are defined in the github-services repo.
          # - `events` (Optional array) : Determines what events the hook is triggered for. Default: ["push"].
          # - `active` (Optional boolean) : Determines whether the hook is actually triggered on pushes.
          @createHook = (name, config, events=['push'], active=true) ->
            data =
              name: name
              config: config
              events: events
              active: active

            _request 'POST', "#{@repoPath}/hooks", data

          # Edit a hook
          # -------
          #
          # - `config` (Optional hash) : A Hash containing key/value pairs to provide settings for this hook.
          #                      Modifying this will replace the entire config object.
          #                      These settings vary between the services and are defined in the github-services repo.
          # - `events` (Optional array) : Determines what events the hook is triggered for.
          #                     This replaces the entire array of events. Default: ["push"].
          # - `addEvents` (Optional array) : Determines a list of events to be added to the list of events that the Hook triggers for.
          # - `removeEvents` (Optional array) : Determines a list of events to be removed from the list of events that the Hook triggers for.
          # - `active` (Optional boolean) : Determines whether the hook is actually triggered on pushes.
          @editHook = (id, config=null, events=null, addEvents=null, removeEvents=null, active=null) ->
            data = {}
            data.config = config if config != null
            data.events = events if events != null
            data.add_events = addEvents if addEvents != null
            data.remove_events = removeEvents if removeEvents != null
            data.active = active if active != null

            _request 'PATCH', "#{@repoPath}/hooks/#{id}", data

          # Test a `push` hook
          # -------
          # This will trigger the hook with the latest push to the current
          # repository if the hook is subscribed to push events.
          # If the hook is not subscribed to push events, the server will
          # respond with 204 but no test POST will be generated.
          @testHook = (id) ->
            _request 'POST', "#{@repoPath}/hooks/#{id}/tests", null

          # Delete a hook
          # -------
          @deleteHook = (id) ->
            _request 'DELETE', "#{@repoPath}/hooks/#{id}", null

          # List all Languages
          # -------
          @getLanguages = ->
            _request 'GET', "#{@repoPath}/languages", null

          # List all releases
          # -------
          @getReleases = () ->
            _request 'GET', "#{@repoPath}/releases", null


      # Gist API
      # -------
      class Gist
        constructor: (@options) ->
          id = @options.id
          _gistPath = "/gists/#{id}"


          # Read the gist
          # --------
          @read = () ->
            _request 'GET', _gistPath, null


          # Create the gist
          # --------
          #
          # Files contains a hash with the filename as the key and
          # `{content: 'File Contents Here'}` as the value.
          #
          # Example:
          #
          #     { "file1.txt": {
          #         "content": "String file contents"
          #       }
          #     }
          @create = (files, isPublic=false, description=null) ->
            options =
              isPublic: isPublic
              files: files
            options.description = description if description?
            _request 'POST', "/gists", options


          # Delete the gist
          # --------
          @delete = () ->
            _request 'DELETE', _gistPath, null


          # Fork a gist
          # --------
          @fork = () ->
            _request 'POST', "#{_gistPath}/forks", null


          # Update a gist with the new stuff
          # --------
          # `files` are files that make up this gist.
          # The key of which should be an optional string filename
          # and the value another optional hash with parameters:
          #
          # - `content`: Optional string - Updated file contents
          # - `filename`: Optional string - New name for this file.
          #
          # **NOTE:** All files from the previous version of the gist are carried
          # over by default if not included in the hash. Deletes can be performed
          # by including the filename with a null hash.
          @update = (files, description=null) ->
            options = {files: files}
            options.description = description if description?
            _request 'PATCH', _gistPath, options

          # Star a gist
          # -------
          @star = () ->
            _request 'PUT', "#{_gistPath}/star"

          # Unstar a gist
          # -------
          @unstar = () ->
            _request 'DELETE', "#{_gistPath}/star"

          # Check if a gist is starred
          # -------
          @isStarred = () ->
            _request 'GET', "#{_gistPath}", null, {isBoolean:true}


      # Top Level API
      # -------
      @getRepo = (user, repo) ->
        throw new Error('BUG! user argument is required') if not user
        throw new Error('BUG! repo argument is required') if not repo

        new Repository(
          user: user
          name: repo
        )

      @getOrg = (name) ->
        new Organization(name)

      # API for viewing info for arbitrary users or the current user
      # if no arguments are provided.
      @getUser = (login=null) ->
        if login
          return new User(login)
        else if clientOptions.password or clientOptions.token
          return new AuthenticatedUser()
        else
          return null

      @getGist = (id) ->
        new Gist(id: id)

      # Returns the login of the current user.
      # When using OAuth this is unknown but is necessary to
      # determine if the current user has commit access to a
      # repository
      @getLogin = () ->
        # 3 cases:
        # 1. No authentication provided
        # 2. Username (and password) provided
        # 3. OAuth token provided
        if clientOptions.password or clientOptions.token
          return new User().getInfo()
          .then (info) ->
            return info.login
        else
          return resolvedPromise(null)



  # Return the class for assignment
  return Octokit

# Register with nodejs, requirejs, or as a global
# -------
# Depending on the context this file is called, register it appropriately

if exports?
  # Use native promises if Harmony is on
  Promise         = @Promise or require('es6-promise').Promise
  XMLHttpRequest  = @XMLHttpRequest or require('xmlhttprequest').XMLHttpRequest

  newPromise = (fn) -> return new Promise(fn)
  allPromises = (promises) -> return Promise.all.call(Promise, promises)

  # Encode using native Base64
  encode = @btoa or (str) ->
    buffer = new Buffer(str, 'binary')
    return buffer.toString('base64')

  Octokit = makeOctokit(newPromise, allPromises, XMLHttpRequest, encode, 'octokit') # `User-Agent` (for nodejs)
  exports.new = (options) -> new Octokit(options)

else

  # Octokit is being used in the browser.
  # Find a Promise API and register with `define` (if available)

  # Register Octokit once a Promise API is loaded.
  # In the case of angular, this may be async.
  createGlobalAndAMD = (newPromise, allPromises) =>
    if @define?
      @define 'octokit', [], () =>
        return makeOctokit(newPromise, allPromises, @XMLHttpRequest, @btoa)
    else
      Octokit = makeOctokit(newPromise, allPromises, @XMLHttpRequest, @btoa)
      # Assign to a global `Octokit`
      @Octokit = Octokit
      @Github = Octokit

  # Determine the correct Promise factory.
  # Try to use libraries before native Promises since most Promise users
  # are already using a library.
  #
  # Try in the following order:
  # - Q Promise
  # - angularjs Promise
  # - jQuery Promise
  # - native Promise or a polyfill
  if @Q
    newPromise = (fn) =>
      deferred = @Q.defer()
      resolve = (val) -> deferred.resolve(val)
      reject  = (err) -> deferred.reject(err)
      fn(resolve, reject)
      return deferred.promise
    allPromises = (promises) -> @Q.all(promises)
    createGlobalAndAMD(newPromise, allPromises)
  else if @angular
    # Details on Angular Promises: http://docs.angularjs.org/api/ng/service/$q
    injector = angular.injector(['ng'])
    injector.invoke ($q) ->
      newPromise = (fn) ->
        deferred = $q.defer()
        resolve = (val) -> deferred.resolve(val)
        reject  = (err) -> deferred.reject(err)
        fn(resolve, reject)
        return deferred.promise
      allPromises = (promises) -> $q.all(promises)
      createGlobalAndAMD(newPromise, allPromises)
  else if @jQuery?.Deferred
    newPromise = (fn) =>
      promise = @jQuery.Deferred()
      resolve = (val) -> promise.resolve(val)
      reject  = (val) -> promise.reject(val)
      fn(resolve, reject)
      return promise.promise()
    allPromises = (promises) =>
      # `jQuery.when` is a little odd.
      # - It accepts each promise as an argument (instead of an array of promises)
      # - Each resolved value is an argument (instead of an array of values)
      #
      # So, convert the array of promises to args and then the resolved args to an array
      return @jQuery.when(promises...).then((promises...) -> return promises)
    createGlobalAndAMD(newPromise, allPromises)

  else if @Promise
    newPromise = (fn) => return new @Promise (resolve, reject) ->
      # Some browsers (like node-webkit 0.8.6) contain an older implementation
      # of Promises that provide 1 argument (a `PromiseResolver`).
      if resolve.fulfill
        fn(resolve.resolve.bind(resolve), resolve.reject.bind(resolve))
      else
        fn(arguments...)
    allPromises = (promises) => @Promise.all.call(@Promise, promises)
    createGlobalAndAMD(newPromise, allPromises)

  else
    # Otherwise, throw an error
    err = (msg) ->
      console?.error?(msg)
      throw new Error(msg)
    err('A Promise API was not found. Supported libraries that have Promises are jQuery, angularjs, and https://github.com/jakearchibald/es6-promise')
