makeTests = (assert, expect, btoa, Octokit) ->

  USERNAME = 'octokit-test'
  TOKEN = 'dca7f85a5911df8e9b7aeb4c5be8f5f50806ac49'

  ORG_NAME = 'octokit-test-org'

  REPO_USER = USERNAME
  REPO_NAME = 'octokit-test-repo' # Cannot use '.' because najax does not like it

  REPO_HOMEPAGE = 'https:/github.com/philschatz/octokit.js'
  OTHER_HOMEPAGE = 'http://example.com'

  OTHER_USERNAME = 'octokit-test2'

  DEFAULT_BRANCH = 'master'

  LONG_TIMEOUT = 10 * 1000 # 10 seconds
  SHORT_TIMEOUT = 5 * 1000 # 5 seconds


  IS_NODE = !! module?

  some = (arr, fn) ->
    for entry in arr
      do (entry) ->
        if fn(entry) == true
          return true
    return false

  trapFail = (promise) ->
    onError = (err) ->
      console.error(JSON.stringify(err))
      assert.catch(err)
    # Depending on the Promise implementation the fail method could be:
    # - `.catch` (native Promise)
    # - `.fail` (jQuery or angularjs)
    promise.catch?(onError) or promise.fail(onError)
    return promise

  helper1 = (done, promise, func) ->
    return trapFail(promise)
    .then(func)
    .then () -> done()

  helper2 = (promise, func) ->
    return trapFail(promise)
    .then(func)

  arrayContainsKey = (arr, key, value) ->
    some arr, (entry) ->
      return entry[key] == value

  describe 'Octokit', () ->
    @timeout(LONG_TIMEOUT)

    GH = 'GH'
    REPO = 'REPO'
    USER = 'USER'
    BRANCH = 'BRANCH'
    ANOTHER_USER = 'ANOTHER_USER'

    STATE = {}

    itIsOk = (obj, funcName) ->
      it "##{funcName}()", (done) ->
        helper1 done, STATE[obj][funcName](), (val) ->
          expect(val).to.be.ok

    before () ->
      options =
        token: TOKEN
        # PhantomJS does not support the `PATCH` verb yet.
        # See https://github.com/ariya/phantomjs/issues/11384 for updates
        usePostInsteadOfPatch:true

      options.useETags = false if IS_NODE

      STATE[GH] = new Octokit(options)
      STATE[USER] = STATE[GH].getUser()

    itIsOk(GH, 'getZen')
    itIsOk(GH, 'getAllUsers')
    #(GH, 'getOrgRepos(orgName, type='all')')
    itIsOk(GH, 'getPublicGists')
    itIsOk(GH, 'getPublicEvents')
    #(GH, 'onRateLimitChanged(listener)')

    describe 'Repo:', () ->
      @timeout(LONG_TIMEOUT)
      PREV_SHA = null

      before (done) ->
        STATE[REPO] = STATE[GH].getRepo(REPO_USER, REPO_NAME)
        STATE[BRANCH] = STATE[REPO].getDefaultBranch()
        createRepo = () ->
          console.log('BEFORE: Creating test repo')
          options =
            description: 'Test Repository for https:/github.com/philschatz/octokit.js'
            homepage: REPO_HOMEPAGE
            # private: false
            # has_issues: false
            # has_wiki: false
            # has_downloads: false
            auto_init: true # Make an initial `master` branch and commit

          trapFail(STATE[USER].createRepo(REPO_NAME, options))
          .then () ->
            console.log('BEFORE: Done Creating test repo')
            setTimeout(done, SHORT_TIMEOUT)

        resetRepoToFirstCommit = (repoInfo) ->
          findLastCommits = (commits, options) ->
            console.log('BEFORE: Found commits')
            if options?.next
              trapFail(options.next())
              .then(findLastCommits)
            else
              console.log('BEFORE: Finding master branch')
              initialCommit = commits[commits.length-1]
              sha = initialCommit.sha

              masterBranch = repoInfo.default_branch
              console.log('BEFORE: Found master branch')
              console.log("BEFORE: Updating #{masterBranch} to #{sha}")
              trapFail(STATE[REPO].git.updateHead(masterBranch, sha, true)) # true == force
              .then () =>
                console.log('BEFORE: Updated HEAD')
                done()

          console.log('BEFORE: Resetting test repo name and homepage')
          trapFail(STATE[REPO].updateInfo({name: REPO_NAME, homepage: REPO_HOMEPAGE}))
          .then () ->
            console.log('BEFORE: Getting recent commits')
            trapFail(STATE[REPO].getCommits())
            .then(findLastCommits)

        # Make sure the repo is empty by deleting it and creating a new one
        console.log('BEFORE: Checking if repo exists')
        promise = STATE[REPO].getInfo()
        .then (val) ->
          # STATE[REPO].git.deleteRepo()
          # .catch(() -> resetRepoToFirstCommit)
          # .then () -> createRepo()

          # Send the repoInfo so we do not rely on cached results (najax does not like that for now)
          resetRepoToFirstCommit(val)

        # Depending on the Promise implementation the fail method could be:
        # - `.catch` (native Promise)
        # - `.fail` (jQuery or angularjs)
        promise.catch?(createRepo) or promise.fail(createRepo)

      describe 'Initially:', () ->
        it 'has one commit', (done) ->
          trapFail(STATE[REPO].getCommits())
          .then (val) ->
            expect(val).to.have.length(1)
            done()

        it 'has one branch', (done) ->
          trapFail(STATE[REPO].getBranches())
          .then (branches) ->
            expect(branches).to.have.length(1)
            done()

      describe 'Writing file(s):', () ->
        it 'commits a single text file', (done) ->
          FILE_PATH = 'test.txt'
          FILE_TEXT = 'Hello there'

          trapFail(STATE[BRANCH].write(FILE_PATH, FILE_TEXT))
          .then (sha) ->
            # Read the file back
            trapFail(STATE[BRANCH].read(FILE_PATH))
            .then (val) ->
              expect(val.content).to.equal(FILE_TEXT)
              PREV_SHA = val.sha
              done()

        it 'removes a single file', (done) ->
          FILE_PATH = 'test.txt'
          trapFail(STATE[BRANCH].remove(FILE_PATH))
          .then () ->
            done()

        it 'commits multiple files at once (including binary ones)', (done) ->
          FILE1 = 'testdir/test1.txt'
          FILE2 = 'testdir/test2.txt'
          BINARY_DATA = 'Ahoy!'
          contents = {}
          contents[FILE1] = 'Hello World!'
          contents[FILE2] = {content:btoa(BINARY_DATA), isBase64:true}

          trapFail(STATE[BRANCH].writeMany(contents))
          .then () ->
            # Read the files and verify they were added
            trapFail(STATE[BRANCH].read(FILE1))
            .then (val) ->
              expect(val.content).to.equal(contents[FILE1])
              trapFail(STATE[BRANCH].read(FILE2))
              .then (val) ->
                expect(val.content).to.equal(contents[FILE2].content)
                done()

        it 'should have created 4 commits (3 + the initial)', (done) ->
          helper1 done, STATE[REPO].getCommits(), (commits) ->
            expect(commits).to.have.length(4)

      describe 'Collaborators:', () ->
        it 'initially should have only 1 collaborator', (done) ->
          helper1 done, STATE[REPO].getCollaborators(), (collaborators) ->
            expect(collaborators).to.have.length(1)

        it 'initially the collaborator should be [USERNAME]', (done) ->
          helper1 done, STATE[REPO].isCollaborator(USERNAME), (canCollaborate) ->
            expect(canCollaborate).to.be.true

        it 'the current user should be able to collaborate', (done) ->
          helper1 done, STATE[REPO].canCollaborate(), (canCollaborate) ->
            expect(canCollaborate).to.be.true

        it 'should be able to add and remove a collaborator', (done) ->
          helper2 STATE[REPO].addCollaborator(OTHER_USERNAME), (added) ->
            expect(added).to.be.true

            helper2 STATE[REPO].isCollaborator(OTHER_USERNAME), (canCollaborate) ->
              expect(canCollaborate).to.be.true

              helper2 STATE[REPO].removeCollaborator(OTHER_USERNAME), (removed) ->
                expect(removed).to.be.true

                helper1 done, STATE[REPO].isCollaborator(OTHER_USERNAME), (canCollaborate) ->
                  expect(canCollaborate).to.be.false

      describe 'Editing Repository:', () ->
        it 'initially the repository homepage should be [REPO_HOMEPAGE]', (done) ->
          helper1 done, STATE[REPO].getInfo(), (info) ->
            expect(info.homepage).to.equal(REPO_HOMEPAGE)

        it 'should be able to edit the repo homepage', (done) ->
          helper2 STATE[REPO].updateInfo({name: REPO_NAME, homepage: OTHER_HOMEPAGE}), ->

            helper1 done, STATE[REPO].getInfo(), (info) ->
              expect(info.homepage).to.equal(OTHER_HOMEPAGE)

        it 'changing the default branch should not explode', (done) ->
          helper1 done, STATE[REPO].setDefaultBranch(DEFAULT_BRANCH), (result) ->
            expect(result.default_branch).to.equal(DEFAULT_BRANCH)

      describe 'fetch organization', () ->
        it 'should be able to fetch organization info', (done) ->

          helper1 done, STATE[GH].getOrg(ORG_NAME).getInfo(), (info) ->
            expect(info.login).to.equal(ORG_NAME)

      describe 'Releases', () ->
        it 'should be able to get releases', (done) ->

          helper1 done, STATE[REPO].getReleases(), (releases) ->
            expect(releases).to.have.length(0)

      describe 'Events:', () ->
        itIsOk(REPO, 'getEvents')
        itIsOk(REPO, 'getIssueEvents')
        itIsOk(REPO, 'getNetworkEvents')
        #itIsOk(REPO, 'getNotifications')

      describe 'Misc:', () ->
        itIsOk(REPO, 'getHooks')
        itIsOk(REPO, 'getLanguages')
        itIsOk(REPO, 'getInfo')


    describe 'Users:', () ->

      describe 'Current User:', () ->

        describe 'Methods for all Users:', () ->
          #itIsOk(USER, 'getNotifications')
          itIsOk(USER, 'getInfo')
          itIsOk(USER, 'getRepos')
          itIsOk(USER, 'getOrgs')
          itIsOk(USER, 'getGists')
          itIsOk(USER, 'getFollowers')
          itIsOk(USER, 'getFollowing')
          #(USER, 'isFollowing')
          # itIsOk(USER, 'getPublicKeys')
          itIsOk(USER, 'getReceivedEvents')
          # itIsOk(USER, 'getEvents')

        describe 'Methods only for authenticated user:', () ->
          #(USER, 'updateInfo(options')
          itIsOk(USER, 'getGists')
          #(USER, 'follow(username)')
          #(USER, 'unfollow(username)')
          itIsOk(USER, 'getEmails')
          #(USER, 'addEmail(emails)')
          #(USER, 'removeEmail(emails)')
          #(USER, 'getPublicKey(id)')
          #(USER, 'addPublicKey(title, key)')
          #(USER, 'updatePublicKey(id, options)')
          itIsOk(USER, 'getReceivedEvents')

      describe 'Another User:', () ->
        before () ->
          STATE[ANOTHER_USER] = STATE[GH].getUser(OTHER_USERNAME)

        # itIsOk(user, 'getNotifications')
        itIsOk(ANOTHER_USER, 'getInfo')
        itIsOk(ANOTHER_USER, 'getRepos')
        itIsOk(ANOTHER_USER, 'getOrgs')
        itIsOk(ANOTHER_USER, 'getGists')
        itIsOk(ANOTHER_USER, 'getFollowers')
        itIsOk(ANOTHER_USER, 'getFollowing')
        #(ANOTHER_USER, 'isFollowing')
        itIsOk(ANOTHER_USER, 'getPublicKeys')
        itIsOk(ANOTHER_USER, 'getReceivedEvents')
        itIsOk(ANOTHER_USER, 'getEvents')


if exports?
  exports.makeTests = makeTests
else
  @makeTests = makeTests
