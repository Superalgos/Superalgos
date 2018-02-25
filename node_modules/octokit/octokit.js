(function() {
  var Octokit, Promise, XMLHttpRequest, allPromises, createGlobalAndAMD, encode, err, injector, makeOctokit, newPromise, _, _ref,
    _this = this,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    __slice = [].slice;

  _ = {};

  _.isEmpty = function(object) {
    return Object.keys(object).length === 0;
  };

  _.isArray = Array.isArray || function(obj) {
    return toString.call(obj) === '[object Array]';
  };

  _.defaults = function(object, values) {
    var key, _i, _len, _ref, _results;
    _ref = Object.keys(values);
    _results = [];
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      key = _ref[_i];
      _results.push((function(key) {
        return object[key] != null ? object[key] : object[key] = values[key];
      })(key));
    }
    return _results;
  };

  _.each = function(object, fn) {
    var arr, key, _i, _len, _ref, _results;
    if (!object) {
      return;
    }
    if (_.isArray(object)) {
      object.forEach(fn);
    }
    arr = [];
    _ref = Object.keys(object);
    _results = [];
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      key = _ref[_i];
      _results.push((function(key) {
        return fn(object[key]);
      })(key));
    }
    return _results;
  };

  _.pairs = function(object) {
    var arr, key, _fn, _i, _len, _ref;
    arr = [];
    _ref = Object.keys(object);
    _fn = function(key) {
      return arr.push([key, object[key]]);
    };
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      key = _ref[_i];
      _fn(key);
    }
    return arr;
  };

  _.map = function(object, fn) {
    var arr, key, _fn, _i, _len, _ref;
    if (_.isArray(object)) {
      return object.map(fn);
    }
    arr = [];
    _ref = Object.keys(object);
    _fn = function(key) {
      return arr.push(fn(object[key]));
    };
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      key = _ref[_i];
      _fn(key);
    }
    return arr;
  };

  _.last = function(object, n) {
    var len;
    len = object.length;
    return object.slice(len - n, len);
  };

  _.select = function(object, fn) {
    return object.filter(fn);
  };

  _.extend = function(object, template) {
    var key, _fn, _i, _len, _ref;
    _ref = Object.keys(template);
    _fn = function(key) {
      return object[key] = template[key];
    };
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      key = _ref[_i];
      _fn(key);
    }
    return object;
  };

  _.toArray = function(object) {
    return Array.prototype.slice.call(object);
  };

  makeOctokit = function(newPromise, allPromises, XMLHttpRequest, base64encode, userAgent) {
    var Octokit, ajax, rejectedPromise, resolvedPromise;
    ajax = function(options) {
      return newPromise(function(resolve, reject) {
        var name, value, xhr, _ref;
        xhr = new XMLHttpRequest();
        xhr.dataType = options.dataType;
        if (typeof xhr.overrideMimeType === "function") {
          xhr.overrideMimeType(options.mimeType);
        }
        xhr.open(options.type, options.url);
        if (options.data && 'GET' !== options.type) {
          xhr.setRequestHeader('Content-Type', options.contentType);
        }
        _ref = options.headers;
        for (name in _ref) {
          value = _ref[name];
          xhr.setRequestHeader(name, value);
        }
        xhr.onreadystatechange = function() {
          var _name, _ref1;
          if (4 === xhr.readyState) {
            if ((_ref1 = options.statusCode) != null) {
              if (typeof _ref1[_name = xhr.status] === "function") {
                _ref1[_name]();
              }
            }
            if (xhr.status >= 200 && xhr.status < 300 || xhr.status === 304) {
              return resolve(xhr);
            } else {
              return reject(xhr);
            }
          }
        };
        return xhr.send(options.data);
      });
    };
    resolvedPromise = function(val) {
      return newPromise(function(resolve, reject) {
        return resolve(val);
      });
    };
    rejectedPromise = function(err) {
      return newPromise(function(resolve, reject) {
        return reject(err);
      });
    };
    Octokit = (function() {
      function Octokit(clientOptions) {
        var AuthenticatedUser, Branch, ETagResponse, Gist, GitRepo, Organization, Repository, Team, User, clearCache, getCache, notifyEnd, notifyStart, setCache, toQueryString, _cachedETags, _client, _listeners, _request;
        if (clientOptions == null) {
          clientOptions = {};
        }
        _.defaults(clientOptions, {
          rootURL: 'https://api.github.com',
          useETags: true,
          usePostInsteadOfPatch: false
        });
        _client = this;
        _listeners = [];
        ETagResponse = (function() {
          function ETagResponse(eTag, data, status) {
            this.eTag = eTag;
            this.data = data;
            this.status = status;
          }

          return ETagResponse;

        })();
        _cachedETags = {};
        notifyStart = function(promise, path) {
          return typeof promise.notify === "function" ? promise.notify({
            type: 'start',
            path: path
          }) : void 0;
        };
        notifyEnd = function(promise, path) {
          return typeof promise.notify === "function" ? promise.notify({
            type: 'end',
            path: path
          }) : void 0;
        };
        _request = function(method, path, data, options) {
          var auth, headers, mimeType, promise;
          if (options == null) {
            options = {
              raw: false,
              isBase64: false,
              isBoolean: false
            };
          }
          if ('PATCH' === method && clientOptions.usePostInsteadOfPatch) {
            method = 'POST';
          }
          if (!/^http/.test(path)) {
            path = "" + clientOptions.rootURL + path;
          }
          mimeType = void 0;
          if (options.isBase64) {
            mimeType = 'text/plain; charset=x-user-defined';
          }
          headers = {
            'Accept': 'application/vnd.github.raw'
          };
          if (userAgent) {
            headers['User-Agent'] = userAgent;
          }
          if (path in _cachedETags) {
            headers['If-None-Match'] = _cachedETags[path].eTag;
          } else {
            headers['If-Modified-Since'] = 'Thu, 01 Jan 1970 00:00:00 GMT';
          }
          if (clientOptions.token || (clientOptions.username && clientOptions.password)) {
            if (clientOptions.token) {
              auth = "token " + clientOptions.token;
            } else {
              auth = 'Basic ' + base64encode("" + clientOptions.username + ":" + clientOptions.password);
            }
            headers['Authorization'] = auth;
          }
          promise = newPromise(function(resolve, reject) {
            var ajaxConfig, always, onError, xhrPromise,
              _this = this;
            ajaxConfig = {
              url: path,
              type: method,
              contentType: 'application/json',
              mimeType: mimeType,
              headers: headers,
              processData: false,
              data: !options.raw && data && JSON.stringify(data) || data,
              dataType: !options.raw ? 'json' : void 0
            };
            if (options.isBoolean) {
              ajaxConfig.statusCode = {
                204: function() {
                  return resolve(true);
                },
                404: function() {
                  return resolve(false);
                }
              };
            }
            xhrPromise = ajax(ajaxConfig);
            always = function(jqXHR) {
              var listener, rateLimit, rateLimitRemaining, _i, _len, _results;
              notifyEnd(_this, path);
              rateLimit = parseFloat(jqXHR.getResponseHeader('X-RateLimit-Limit'));
              rateLimitRemaining = parseFloat(jqXHR.getResponseHeader('X-RateLimit-Remaining'));
              _results = [];
              for (_i = 0, _len = _listeners.length; _i < _len; _i++) {
                listener = _listeners[_i];
                _results.push(listener(rateLimitRemaining, rateLimit, method, path, data, options));
              }
              return _results;
            };
            xhrPromise.then(function(jqXHR) {
              var converted, eTag, eTagResponse, i, links, valOptions, _i, _ref;
              always(jqXHR);
              if (304 === jqXHR.status) {
                if (clientOptions.useETags && _cachedETags[path]) {
                  eTagResponse = _cachedETags[path];
                  return resolve(eTagResponse.data, eTagResponse.status, jqXHR);
                } else {
                  return resolve(jqXHR.responseText, status, jqXHR);
                }
              } else if (204 === jqXHR.status && options.isBoolean) {
                return resolve(true, status, jqXHR);
              } else {
                if (jqXHR.responseText && 'json' === ajaxConfig.dataType) {
                  data = JSON.parse(jqXHR.responseText);
                  valOptions = {};
                  links = jqXHR.getResponseHeader('Link');
                  _.each(links != null ? links.split(',') : void 0, function(part) {
                    var discard, href, rel, _ref;
                    _ref = part.match(/<([^>]+)>;\ rel="([^"]+)"/), discard = _ref[0], href = _ref[1], rel = _ref[2];
                    return valOptions["" + rel + "Page"] = function() {
                      return _request('GET', href, null, options);
                    };
                  });
                  _.extend(data, valOptions);
                } else {
                  data = jqXHR.responseText;
                }
                if ('GET' === method && options.isBase64) {
                  converted = '';
                  for (i = _i = 0, _ref = data.length; 0 <= _ref ? _i <= _ref : _i >= _ref; i = 0 <= _ref ? ++_i : --_i) {
                    converted += String.fromCharCode(data.charCodeAt(i) & 0xff);
                  }
                  data = converted;
                }
                if ('GET' === method && jqXHR.getResponseHeader('ETag') && clientOptions.useETags) {
                  eTag = jqXHR.getResponseHeader('ETag');
                  _cachedETags[path] = new ETagResponse(eTag, data, jqXHR.status);
                }
                return resolve(data, jqXHR.status, jqXHR);
              }
            });
            onError = function(jqXHR) {
              var err, json;
              always(jqXHR);
              if (options.isBoolean && 404 === jqXHR.status) {
                return resolve(false);
              } else {
                if (jqXHR.getResponseHeader('Content-Type') !== 'application/json; charset=utf-8') {
                  err = new Error(jqXHR.responseText);
                  err['status'] = jqXHR.status;
                  err['__jqXHR'] = jqXHR;
                  return reject(err);
                } else {
                  err = new Error("Github error: " + jqXHR.responseText);
                  if (jqXHR.responseText) {
                    json = JSON.parse(jqXHR.responseText);
                  } else {
                    json = '';
                  }
                  err['error'] = json;
                  err['status'] = jqXHR.status;
                  err['__jqXHR'] = jqXHR;
                  return reject(err);
                }
              }
            };
            return (typeof xhrPromise["catch"] === "function" ? xhrPromise["catch"](onError) : void 0) || xhrPromise.fail(onError);
          });
          notifyStart(promise, path);
          return promise;
        };
        toQueryString = function(options) {
          var params;
          if (_.isEmpty(options)) {
            return '';
          }
          params = [];
          _.each(_.pairs(options), function(_arg) {
            var key, value;
            key = _arg[0], value = _arg[1];
            return params.push("" + key + "=" + (encodeURIComponent(value)));
          });
          return "?" + (params.join('&'));
        };
        this.clearCache = clearCache = function() {
          return _cachedETags = {};
        };
        this.getCache = getCache = function() {
          return _cachedETags;
        };
        this.setCache = setCache = function(cachedETags) {
          if (!(cachedETags !== null && typeof cachedETags === 'object')) {
            throw new Error('BUG: argument of method "setCache" should be an object');
          } else {
            return _cachedETags = cachedETags;
          }
        };
        this.onRateLimitChanged = function(listener) {
          return _listeners.push(listener);
        };
        this.getZen = function() {
          return _request('GET', '/zen', null, {
            raw: true
          });
        };
        this.getAllUsers = function(since) {
          var options;
          if (since == null) {
            since = null;
          }
          options = {};
          if (since) {
            options.since = since;
          }
          return _request('GET', '/users', options);
        };
        this.getOrgRepos = function(orgName, type) {
          if (type == null) {
            type = 'all';
          }
          return _request('GET', "/orgs/" + orgName + "/repos?type=" + type + "&per_page=1000&sort=updated&direction=desc", null);
        };
        this.getPublicGists = function(since) {
          var getDate, options;
          if (since == null) {
            since = null;
          }
          options = null;
          getDate = function(time) {
            if (Date === time.constructor) {
              return time.toISOString();
            }
            return time;
          };
          if (since) {
            options = {
              since: getDate(since)
            };
          }
          return _request('GET', '/gists/public', options);
        };
        this.getPublicEvents = function() {
          return _request('GET', '/events', null);
        };
        this.getNotifications = function(options) {
          var getDate, queryString;
          if (options == null) {
            options = {};
          }
          getDate = function(time) {
            if (Date === time.constructor) {
              return time.toISOString();
            }
            return time;
          };
          if (options.since) {
            options.since = getDate(options.since);
          }
          queryString = toQueryString(options);
          return _request('GET', "/notifications" + queryString, null);
        };
        User = (function() {
          function User(_username) {
            var _cachedInfo, _rootPath;
            if (_username == null) {
              _username = null;
            }
            if (_username) {
              _rootPath = "/users/" + _username;
            } else {
              _rootPath = "/user";
            }
            _cachedInfo = null;
            this.getInfo = function(force) {
              if (force == null) {
                force = false;
              }
              if (force) {
                _cachedInfo = null;
              }
              if (_cachedInfo) {
                return resolvedPromise(_cachedInfo);
              }
              return _request('GET', "" + _rootPath, null).then(function(info) {
                return _cachedInfo = info;
              });
            };
            this.getRepos = function(type, sort, direction) {
              if (type == null) {
                type = 'all';
              }
              if (sort == null) {
                sort = 'pushed';
              }
              if (direction == null) {
                direction = 'desc';
              }
              return _request('GET', "" + _rootPath + "/repos?type=" + type + "&per_page=1000&sort=" + sort + "&direction=" + direction, null);
            };
            this.getOrgs = function() {
              return _request('GET', "" + _rootPath + "/orgs", null);
            };
            this.getGists = function() {
              return _request('GET', "" + _rootPath + "/gists", null);
            };
            this.getFollowers = function() {
              return _request('GET', "" + _rootPath + "/followers", null);
            };
            this.getFollowing = function() {
              return _request('GET', "" + _rootPath + "/following", null);
            };
            this.isFollowing = function(user) {
              return _request('GET', "" + _rootPath + "/following/" + user, null, {
                isBoolean: true
              });
            };
            this.getPublicKeys = function() {
              return _request('GET', "" + _rootPath + "/keys", null);
            };
            this.getReceivedEvents = function(onlyPublic) {
              var isPublic;
              if (!_username) {
                throw new Error('BUG: This does not work for authenticated users yet!');
              }
              isPublic = '';
              if (onlyPublic) {
                isPublic = '/public';
              }
              return _request('GET', "/users/" + _username + "/received_events" + isPublic, null);
            };
            this.getEvents = function(onlyPublic) {
              var isPublic;
              if (!_username) {
                throw new Error('BUG: This does not work for authenticated users yet!');
              }
              isPublic = '';
              if (onlyPublic) {
                isPublic = '/public';
              }
              return _request('GET', "/users/" + _username + "/events" + isPublic, null);
            };
          }

          return User;

        })();
        AuthenticatedUser = (function(_super) {
          __extends(AuthenticatedUser, _super);

          function AuthenticatedUser() {
            AuthenticatedUser.__super__.constructor.call(this);
            this.updateInfo = function(options) {
              return _request('PATCH', '/user', options);
            };
            this.getGists = function() {
              return _request('GET', '/gists', null);
            };
            this.follow = function(username) {
              return _request('PUT', "/user/following/" + username, null);
            };
            this.unfollow = function(username) {
              return _request('DELETE', "/user/following/" + username, null);
            };
            this.getEmails = function() {
              return _request('GET', '/user/emails', null);
            };
            this.addEmail = function(emails) {
              if (!_.isArray(emails)) {
                emails = [emails];
              }
              return _request('POST', '/user/emails', emails);
            };
            this.addEmail = function(emails) {
              if (!_.isArray(emails)) {
                emails = [emails];
              }
              return _request('DELETE', '/user/emails', emails);
            };
            this.getPublicKey = function(id) {
              return _request('GET', "/user/keys/" + id, null);
            };
            this.addPublicKey = function(title, key) {
              return _request('POST', "/user/keys", {
                title: title,
                key: key
              });
            };
            this.updatePublicKey = function(id, options) {
              return _request('PATCH', "/user/keys/" + id, options);
            };
            this.createRepo = function(name, options) {
              if (options == null) {
                options = {};
              }
              options.name = name;
              return _request('POST', "/user/repos", options);
            };
            this.getReceivedEvents = function(username, page) {
              var currentPage;
              if (page == null) {
                page = 1;
              }
              currentPage = '?page=' + page;
              return _request('GET', '/users/' + username + '/received_events' + currentPage, null);
            };
            this.getStars = function() {
              return _request('GET', "/user/starred");
            };
            this.putStar = function(owner, repo) {
              return _request('PUT', "/user/starred/" + owner + "/" + repo);
            };
            this.deleteStar = function(owner, repo) {
              return _request('DELETE', "/user/starred/" + owner + "/" + repo);
            };
          }

          return AuthenticatedUser;

        })(User);
        Team = (function() {
          function Team(id) {
            this.id = id;
            this.getInfo = function() {
              return _request('GET', "/teams/" + this.id, null);
            };
            this.updateTeam = function(options) {
              return _request('PATCH', "/teams/" + this.id, options);
            };
            this.remove = function() {
              return _request('DELETE', "/teams/" + this.id);
            };
            this.getMembers = function() {
              return _request('GET', "/teams/" + this.id + "/members");
            };
            this.isMember = function(user) {
              return _request('GET', "/teams/" + this.id + "/members/" + user, null, {
                isBoolean: true
              });
            };
            this.addMember = function(user) {
              return _request('PUT', "/teams/" + this.id + "/members/" + user);
            };
            this.removeMember = function(user) {
              return _request('DELETE', "/teams/" + this.id + "/members/" + user);
            };
            this.getRepos = function() {
              return _request('GET', "/teams/" + this.id + "/repos");
            };
            this.addRepo = function(orgName, repoName) {
              return _request('PUT', "/teams/" + this.id + "/repos/" + orgName + "/" + repoName);
            };
            this.removeRepo = function(orgName, repoName) {
              return _request('DELETE', "/teams/" + this.id + "/repos/" + orgName + "/" + repoName);
            };
          }

          return Team;

        })();
        Organization = (function() {
          function Organization(name) {
            this.name = name;
            this.getInfo = function() {
              return _request('GET', "/orgs/" + this.name, null);
            };
            this.updateInfo = function(options) {
              return _request('PATCH', "/orgs/" + this.name, options);
            };
            this.getTeams = function() {
              return _request('GET', "/orgs/" + this.name + "/teams", null);
            };
            this.createTeam = function(name, repoNames, permission) {
              var options;
              if (repoNames == null) {
                repoNames = null;
              }
              if (permission == null) {
                permission = 'pull';
              }
              options = {
                name: name,
                permission: permission
              };
              if (repoNames) {
                options.repo_names = repoNames;
              }
              return _request('POST', "/orgs/" + this.name + "/teams", options);
            };
            this.getMembers = function() {
              return _request('GET', "/orgs/" + this.name + "/members", null);
            };
            this.isMember = function(user) {
              return _request('GET', "/orgs/" + this.name + "/members/" + user, null, {
                isBoolean: true
              });
            };
            this.removeMember = function(user) {
              return _request('DELETE', "/orgs/" + this.name + "/members/" + user, null);
            };
            this.createRepo = function(name, options) {
              if (options == null) {
                options = {};
              }
              options.name = name;
              return _request('POST', "/orgs/" + this.name + "/repos", options);
            };
            this.getRepos = function() {
              return _request('GET', "/orgs/" + this.name + "/repos?type=all", null);
            };
          }

          return Organization;

        })();
        GitRepo = (function() {
          function GitRepo(repoUser, repoName) {
            var _repoPath;
            this.repoUser = repoUser;
            this.repoName = repoName;
            _repoPath = "/repos/" + this.repoUser + "/" + this.repoName;
            this.deleteRepo = function() {
              return _request('DELETE', "" + _repoPath);
            };
            this._updateTree = function(branch) {
              return this.getRef("heads/" + branch);
            };
            this.getRef = function(ref) {
              var _this = this;
              return _request('GET', "" + _repoPath + "/git/refs/" + ref, null).then(function(res) {
                return res.object.sha;
              });
            };
            this.createRef = function(options) {
              return _request('POST', "" + _repoPath + "/git/refs", options);
            };
            this.deleteRef = function(ref) {
              return _request('DELETE', "" + _repoPath + "/git/refs/" + ref, this.options);
            };
            this.getBranches = function() {
              var _this = this;
              return _request('GET', "" + _repoPath + "/git/refs/heads", null).then(function(heads) {
                return _.map(heads, function(head) {
                  return _.last(head.ref.split("/"));
                });
              });
            };
            this.getBlob = function(sha, isBase64) {
              return _request('GET', "" + _repoPath + "/git/blobs/" + sha, null, {
                raw: true,
                isBase64: isBase64
              });
            };
            this.getSha = function(branch, path) {
              var _this = this;
              if (path === '') {
                return this.getRef("heads/" + branch);
              }
              return this.getTree(branch, {
                recursive: true
              }).then(function(tree) {
                var file;
                file = _.select(tree, function(file) {
                  return file.path === path;
                })[0];
                if (file != null ? file.sha : void 0) {
                  return file != null ? file.sha : void 0;
                }
                return rejectedPromise({
                  message: 'SHA_NOT_FOUND'
                });
              });
            };
            this.getContents = function(path, sha) {
              var queryString,
                _this = this;
              if (sha == null) {
                sha = null;
              }
              queryString = '';
              if (sha !== null) {
                queryString = toQueryString({
                  ref: sha
                });
              }
              return _request('GET', "" + _repoPath + "/contents/" + path + queryString, null, {
                raw: true
              }).then(function(contents) {
                return contents;
              });
            };
            this.removeFile = function(path, message, sha, branch) {
              var params;
              params = {
                message: message,
                sha: sha,
                branch: branch
              };
              return _request('DELETE', "" + _repoPath + "/contents/" + path, params, null);
            };
            this.getTree = function(tree, options) {
              var queryString,
                _this = this;
              if (options == null) {
                options = null;
              }
              queryString = toQueryString(options);
              return _request('GET', "" + _repoPath + "/git/trees/" + tree + queryString, null).then(function(res) {
                return res.tree;
              });
            };
            this.postBlob = function(content, isBase64) {
              var _this = this;
              if (typeof content === 'string') {
                if (isBase64) {
                  content = base64encode(content);
                }
                content = {
                  content: content,
                  encoding: 'utf-8'
                };
              }
              if (isBase64) {
                content.encoding = 'base64';
              }
              return _request('POST', "" + _repoPath + "/git/blobs", content).then(function(res) {
                return res.sha;
              });
            };
            this.updateTreeMany = function(baseTree, newTree) {
              var data,
                _this = this;
              data = {
                base_tree: baseTree,
                tree: newTree
              };
              return _request('POST', "" + _repoPath + "/git/trees", data).then(function(res) {
                return res.sha;
              });
            };
            this.postTree = function(tree) {
              var _this = this;
              return _request('POST', "" + _repoPath + "/git/trees", {
                tree: tree
              }).then(function(res) {
                return res.sha;
              });
            };
            this.commit = function(parents, tree, message) {
              var data;
              if (!_.isArray(parents)) {
                parents = [parents];
              }
              data = {
                message: message,
                parents: parents,
                tree: tree
              };
              return _request('POST', "" + _repoPath + "/git/commits", data).then(function(commit) {
                return commit.sha;
              });
            };
            this.updateHead = function(head, commit, force) {
              var options;
              if (force == null) {
                force = false;
              }
              options = {
                sha: commit
              };
              if (force) {
                options.force = true;
              }
              return _request('PATCH', "" + _repoPath + "/git/refs/heads/" + head, options);
            };
            this.getCommit = function(sha) {
              return _request('GET', "" + _repoPath + "/commits/" + sha, null);
            };
            this.getCommits = function(options) {
              var getDate, queryString;
              if (options == null) {
                options = {};
              }
              options = _.extend({}, options);
              getDate = function(time) {
                if (Date === time.constructor) {
                  return time.toISOString();
                }
                return time;
              };
              if (options.since) {
                options.since = getDate(options.since);
              }
              if (options.until) {
                options.until = getDate(options.until);
              }
              queryString = toQueryString(options);
              return _request('GET', "" + _repoPath + "/commits" + queryString, null);
            };
          }

          return GitRepo;

        })();
        Branch = (function() {
          function Branch(git, getRef) {
            var _getRef, _git;
            _git = git;
            _getRef = getRef || function() {
              throw new Error('BUG: No way to fetch branch ref!');
            };
            this.getCommit = function(sha) {
              return _git.getCommit(sha);
            };
            this.getCommits = function(options) {
              if (options == null) {
                options = {};
              }
              options = _.extend({}, options);
              return _getRef().then(function(branch) {
                options.sha = branch;
                return _git.getCommits(options);
              });
            };
            this.createBranch = function(newBranchName) {
              var _this = this;
              return _getRef().then(function(branch) {
                return _git.getSha(branch, '').then(function(sha) {
                  return _git.createRef({
                    sha: sha,
                    ref: "refs/heads/" + newBranchName
                  });
                });
              });
            };
            this.read = function(path, isBase64) {
              var _this = this;
              return _getRef().then(function(branch) {
                return _git.getSha(branch, path).then(function(sha) {
                  return _git.getBlob(sha, isBase64).then(function(bytes) {
                    return {
                      sha: sha,
                      content: bytes
                    };
                  });
                });
              });
            };
            this.contents = function(path) {
              var _this = this;
              return _getRef().then(function(branch) {
                return _git.getSha(branch, '').then(function(sha) {
                  return _git.getContents(path, sha).then(function(contents) {
                    return contents;
                  });
                });
              });
            };
            this.remove = function(path, message, sha) {
              var _this = this;
              if (message == null) {
                message = "Removed " + path;
              }
              if (sha == null) {
                sha = null;
              }
              return _getRef().then(function(branch) {
                if (sha) {
                  return _git.removeFile(path, message, sha, branch);
                } else {
                  return _git.getSha(branch, path).then(function(sha) {
                    return _git.removeFile(path, message, sha, branch);
                  });
                }
              });
            };
            this.move = function(path, newPath, message) {
              var _this = this;
              if (message == null) {
                message = "Moved " + path;
              }
              return _getRef().then(function(branch) {
                return _git._updateTree(branch).then(function(latestCommit) {
                  return _git.getTree(latestCommit, {
                    recursive: true
                  }).then(function(tree) {
                    _.each(tree, function(ref) {
                      if (ref.path === path) {
                        ref.path = newPath;
                      }
                      if (ref.type === 'tree') {
                        return delete ref.sha;
                      }
                    });
                    return _git.postTree(tree).then(function(rootTree) {
                      return _git.commit(latestCommit, rootTree, message).then(function(commit) {
                        return _git.updateHead(branch, commit).then(function(res) {
                          return res;
                        });
                      });
                    });
                  });
                });
              });
            };
            this.write = function(path, content, message, isBase64, parentCommitSha) {
              var contents;
              if (message == null) {
                message = "Changed " + path;
              }
              if (parentCommitSha == null) {
                parentCommitSha = null;
              }
              contents = {};
              contents[path] = {
                content: content,
                isBase64: isBase64
              };
              return this.writeMany(contents, message, parentCommitSha);
            };
            this.writeMany = function(contents, message, parentCommitShas) {
              var _this = this;
              if (message == null) {
                message = "Changed Multiple";
              }
              if (parentCommitShas == null) {
                parentCommitShas = null;
              }
              return _getRef().then(function(branch) {
                var afterParentCommitShas;
                afterParentCommitShas = function(parentCommitShas) {
                  var promises;
                  promises = _.map(_.pairs(contents), function(_arg) {
                    var content, data, isBase64, path,
                      _this = this;
                    path = _arg[0], data = _arg[1];
                    content = data.content || data;
                    isBase64 = data.isBase64 || false;
                    return _git.postBlob(content, isBase64).then(function(blob) {
                      return {
                        path: path,
                        mode: '100644',
                        type: 'blob',
                        sha: blob
                      };
                    });
                  });
                  return allPromises(promises).then(function(newTrees) {
                    return _git.updateTreeMany(parentCommitShas, newTrees).then(function(tree) {
                      return _git.commit(parentCommitShas, tree, message).then(function(commitSha) {
                        return _git.updateHead(branch, commitSha).then(function(res) {
                          return res.object;
                        });
                      });
                    });
                  });
                };
                if (parentCommitShas) {
                  return afterParentCommitShas(parentCommitShas);
                } else {
                  return _git._updateTree(branch).then(afterParentCommitShas);
                }
              });
            };
          }

          return Branch;

        })();
        Repository = (function() {
          function Repository(options) {
            var _repo, _user;
            this.options = options;
            _user = this.options.user;
            _repo = this.options.name;
            this.git = new GitRepo(_user, _repo);
            this.repoPath = "/repos/" + _user + "/" + _repo;
            this.currentTree = {
              branch: null,
              sha: null
            };
            this.updateInfo = function(options) {
              return _request('PATCH', this.repoPath, options);
            };
            this.getBranches = function() {
              return this.git.getBranches();
            };
            this.getBranch = function(branchName) {
              var getRef,
                _this = this;
              if (branchName == null) {
                branchName = null;
              }
              if (branchName) {
                getRef = function() {
                  return resolvedPromise(branchName);
                };
                return new Branch(this.git, getRef);
              } else {
                return this.getDefaultBranch();
              }
            };
            this.getDefaultBranch = function() {
              var getRef,
                _this = this;
              getRef = function() {
                return _this.getInfo().then(function(info) {
                  return info.default_branch;
                });
              };
              return new Branch(this.git, getRef);
            };
            this.setDefaultBranch = function(branchName) {
              return this.updateInfo({
                name: _repo,
                default_branch: branchName
              });
            };
            this.getInfo = function() {
              return _request('GET', this.repoPath, null);
            };
            this.getContents = function(branch, path) {
              return _request('GET', "" + this.repoPath + "/contents?ref=" + branch, {
                path: path
              });
            };
            this.fork = function(organization) {
              if (organization) {
                return _request('POST', "" + this.repoPath + "/forks", {
                  organization: organization
                });
              } else {
                return _request('POST', "" + this.repoPath + "/forks", null);
              }
            };
            this.createPullRequest = function(options) {
              return _request('POST', "" + this.repoPath + "/pulls", options);
            };
            this.getCommits = function(options) {
              return this.git.getCommits(options);
            };
            this.getEvents = function() {
              return _request('GET', "" + this.repoPath + "/events", null);
            };
            this.getIssueEvents = function() {
              return _request('GET', "" + this.repoPath + "/issues/events", null);
            };
            this.getNetworkEvents = function() {
              return _request('GET', "/networks/" + _user + "/" + _repo + "/events", null);
            };
            this.getNotifications = function(options) {
              var getDate, queryString;
              if (options == null) {
                options = {};
              }
              getDate = function(time) {
                if (Date === time.constructor) {
                  return time.toISOString();
                }
                return time;
              };
              if (options.since) {
                options.since = getDate(options.since);
              }
              queryString = toQueryString(options);
              return _request('GET', "" + this.repoPath + "/notifications" + queryString, null);
            };
            this.getCollaborators = function() {
              return _request('GET', "" + this.repoPath + "/collaborators", null);
            };
            this.addCollaborator = function(username) {
              if (!username) {
                throw new Error('BUG: username is required');
              }
              return _request('PUT', "" + this.repoPath + "/collaborators/" + username, null, {
                isBoolean: true
              });
            };
            this.removeCollaborator = function(username) {
              if (!username) {
                throw new Error('BUG: username is required');
              }
              return _request('DELETE', "" + this.repoPath + "/collaborators/" + username, null, {
                isBoolean: true
              });
            };
            this.isCollaborator = function(username) {
              if (username == null) {
                username = null;
              }
              if (!username) {
                throw new Error('BUG: username is required');
              }
              return _request('GET', "" + this.repoPath + "/collaborators/" + username, null, {
                isBoolean: true
              });
            };
            this.canCollaborate = function() {
              var _this = this;
              if (!(clientOptions.password || clientOptions.token)) {
                return resolvedPromise(false);
              }
              return _client.getLogin().then(function(login) {
                if (!login) {
                  return false;
                } else {
                  return _this.isCollaborator(login);
                }
              }).then(null, function(err) {
                return false;
              });
            };
            this.getHooks = function() {
              return _request('GET', "" + this.repoPath + "/hooks", null);
            };
            this.getHook = function(id) {
              return _request('GET', "" + this.repoPath + "/hooks/" + id, null);
            };
            this.createHook = function(name, config, events, active) {
              var data;
              if (events == null) {
                events = ['push'];
              }
              if (active == null) {
                active = true;
              }
              data = {
                name: name,
                config: config,
                events: events,
                active: active
              };
              return _request('POST', "" + this.repoPath + "/hooks", data);
            };
            this.editHook = function(id, config, events, addEvents, removeEvents, active) {
              var data;
              if (config == null) {
                config = null;
              }
              if (events == null) {
                events = null;
              }
              if (addEvents == null) {
                addEvents = null;
              }
              if (removeEvents == null) {
                removeEvents = null;
              }
              if (active == null) {
                active = null;
              }
              data = {};
              if (config !== null) {
                data.config = config;
              }
              if (events !== null) {
                data.events = events;
              }
              if (addEvents !== null) {
                data.add_events = addEvents;
              }
              if (removeEvents !== null) {
                data.remove_events = removeEvents;
              }
              if (active !== null) {
                data.active = active;
              }
              return _request('PATCH', "" + this.repoPath + "/hooks/" + id, data);
            };
            this.testHook = function(id) {
              return _request('POST', "" + this.repoPath + "/hooks/" + id + "/tests", null);
            };
            this.deleteHook = function(id) {
              return _request('DELETE', "" + this.repoPath + "/hooks/" + id, null);
            };
            this.getLanguages = function() {
              return _request('GET', "" + this.repoPath + "/languages", null);
            };
            this.getReleases = function() {
              return _request('GET', "" + this.repoPath + "/releases", null);
            };
          }

          return Repository;

        })();
        Gist = (function() {
          function Gist(options) {
            var id, _gistPath;
            this.options = options;
            id = this.options.id;
            _gistPath = "/gists/" + id;
            this.read = function() {
              return _request('GET', _gistPath, null);
            };
            this.create = function(files, isPublic, description) {
              if (isPublic == null) {
                isPublic = false;
              }
              if (description == null) {
                description = null;
              }
              options = {
                isPublic: isPublic,
                files: files
              };
              if (description != null) {
                options.description = description;
              }
              return _request('POST', "/gists", options);
            };
            this["delete"] = function() {
              return _request('DELETE', _gistPath, null);
            };
            this.fork = function() {
              return _request('POST', "" + _gistPath + "/forks", null);
            };
            this.update = function(files, description) {
              if (description == null) {
                description = null;
              }
              options = {
                files: files
              };
              if (description != null) {
                options.description = description;
              }
              return _request('PATCH', _gistPath, options);
            };
            this.star = function() {
              return _request('PUT', "" + _gistPath + "/star");
            };
            this.unstar = function() {
              return _request('DELETE', "" + _gistPath + "/star");
            };
            this.isStarred = function() {
              return _request('GET', "" + _gistPath, null, {
                isBoolean: true
              });
            };
          }

          return Gist;

        })();
        this.getRepo = function(user, repo) {
          if (!user) {
            throw new Error('BUG! user argument is required');
          }
          if (!repo) {
            throw new Error('BUG! repo argument is required');
          }
          return new Repository({
            user: user,
            name: repo
          });
        };
        this.getOrg = function(name) {
          return new Organization(name);
        };
        this.getUser = function(login) {
          if (login == null) {
            login = null;
          }
          if (login) {
            return new User(login);
          } else if (clientOptions.password || clientOptions.token) {
            return new AuthenticatedUser();
          } else {
            return null;
          }
        };
        this.getGist = function(id) {
          return new Gist({
            id: id
          });
        };
        this.getLogin = function() {
          if (clientOptions.password || clientOptions.token) {
            return new User().getInfo().then(function(info) {
              return info.login;
            });
          } else {
            return resolvedPromise(null);
          }
        };
      }

      return Octokit;

    })();
    return Octokit;
  };

  if (typeof exports !== "undefined" && exports !== null) {
    Promise = this.Promise || require('es6-promise').Promise;
    XMLHttpRequest = this.XMLHttpRequest || require('xmlhttprequest').XMLHttpRequest;
    newPromise = function(fn) {
      return new Promise(fn);
    };
    allPromises = function(promises) {
      return Promise.all.call(Promise, promises);
    };
    encode = this.btoa || function(str) {
      var buffer;
      buffer = new Buffer(str, 'binary');
      return buffer.toString('base64');
    };
    Octokit = makeOctokit(newPromise, allPromises, XMLHttpRequest, encode, 'octokit');
    exports["new"] = function(options) {
      return new Octokit(options);
    };
  } else {
    createGlobalAndAMD = function(newPromise, allPromises) {
      if (_this.define != null) {
        return _this.define('octokit', [], function() {
          return makeOctokit(newPromise, allPromises, _this.XMLHttpRequest, _this.btoa);
        });
      } else {
        Octokit = makeOctokit(newPromise, allPromises, _this.XMLHttpRequest, _this.btoa);
        _this.Octokit = Octokit;
        return _this.Github = Octokit;
      }
    };
    if (this.Q) {
      newPromise = function(fn) {
        var deferred, reject, resolve;
        deferred = _this.Q.defer();
        resolve = function(val) {
          return deferred.resolve(val);
        };
        reject = function(err) {
          return deferred.reject(err);
        };
        fn(resolve, reject);
        return deferred.promise;
      };
      allPromises = function(promises) {
        return this.Q.all(promises);
      };
      createGlobalAndAMD(newPromise, allPromises);
    } else if (this.angular) {
      injector = angular.injector(['ng']);
      injector.invoke(function($q) {
        newPromise = function(fn) {
          var deferred, reject, resolve;
          deferred = $q.defer();
          resolve = function(val) {
            return deferred.resolve(val);
          };
          reject = function(err) {
            return deferred.reject(err);
          };
          fn(resolve, reject);
          return deferred.promise;
        };
        allPromises = function(promises) {
          return $q.all(promises);
        };
        return createGlobalAndAMD(newPromise, allPromises);
      });
    } else if ((_ref = this.jQuery) != null ? _ref.Deferred : void 0) {
      newPromise = function(fn) {
        var promise, reject, resolve;
        promise = _this.jQuery.Deferred();
        resolve = function(val) {
          return promise.resolve(val);
        };
        reject = function(val) {
          return promise.reject(val);
        };
        fn(resolve, reject);
        return promise.promise();
      };
      allPromises = function(promises) {
        var _ref1;
        return (_ref1 = _this.jQuery).when.apply(_ref1, promises).then(function() {
          var promises;
          promises = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
          return promises;
        });
      };
      createGlobalAndAMD(newPromise, allPromises);
    } else if (this.Promise) {
      newPromise = function(fn) {
        return new _this.Promise(function(resolve, reject) {
          if (resolve.fulfill) {
            return fn(resolve.resolve.bind(resolve), resolve.reject.bind(resolve));
          } else {
            return fn.apply(null, arguments);
          }
        });
      };
      allPromises = function(promises) {
        return _this.Promise.all.call(_this.Promise, promises);
      };
      createGlobalAndAMD(newPromise, allPromises);
    } else {
      err = function(msg) {
        if (typeof console !== "undefined" && console !== null) {
          if (typeof console.error === "function") {
            console.error(msg);
          }
        }
        throw new Error(msg);
      };
      err('A Promise API was not found. Supported libraries that have Promises are jQuery, angularjs, and https://github.com/jakearchibald/es6-promise');
    }
  }

}).call(this);
