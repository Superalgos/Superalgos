# Logging documentation

Superalgos is made of a few apps and logging has been unified to aid debugging.

The Superalgos apps are:

- Platform
- Tasks
- Network
- Social Trading
- Dashboards

Each of these apps has a dedicated logging folder. When each app is started it will initialise a logger factory which will output logs to the command line and to a series of date stamped files. The logs will be placed in either a direcotory specified by you or the default directory `./Platform/My-Log-Files` this chosen directory will have a subset of folders one for each app:

```cmd
./Platform/My-Log-Files
  |-- Dashboards
  |   |-- error/%DATE%.log
  |   |-- combined/%DATE%.log
  |-- Network
  |   |-- error/%DATE%.log
  |   |-- combined/%DATE%.log
  |-- Platform
  |   |-- error/%DATE%.log
  |   |-- combined/%DATE%.log
  |-- Tasks
  |   |-- <TASK_ID>
  |       |-- error/%DATE%.log
  |       |-- combined/%DATE%.log
  |-- SocialTrading
      |-- error/%DATE%.log
      |-- combined/%DATE%.log
```

## Usage

All the loggers use the same factory provider and have the following methods available:

- debug
- info
- warn
- error

To log within the app, please take note of the files folder structure as this will dictate where to find your logs. All logging should use the `SA.logger.<method>(...)` call. This will automatically apply a date stamp and the method label so you will end up with the following examples:

From the Platform app code

```js
SA.logger.info('Superalgos Platform App is Running!')
```

CLI output

```log
2023-01-31T16:44:06.513Z | info | SA | Superalgos Platform App is Running!
```


File output

```log
2023-01-31T16:44:06.513Z | info | Superalgos Platform App is Running!
```

From a Task server code

```js
SA.logger.info('Superalgos Task Server is Running!')
```

CLI output

```log
2023-01-31T16:45:33.371Z | info | TS | Superalgos Task Server is Running!
```

```log
2023-01-31T16:45:33.371Z | info | Superalgos Task Server is Running!
```

## Log levels

The majority of the code base uses the info and error log levels. All the file logs will write info, warn and error logs data. The console output will be default write the same log levels. There is now an argument you can pass to the CLI or save to a profile to override the console defaults.

### Changing the console output verbosity

To specify a different output level for the console logs, you can add the `logLevel` argument to the start up script. The only difference is 'debug' which will be applied to the file output as well - the reasoning being it is most likely a developer using it for a temporary period of time.

All the below are valid input, only supply 1 level, everything more severe will be logged:

Debug
- logLevel=debug
- logLevel = debug
- logLevel debug
- -logLevel=debug
- -logLevel = debug
- -logLevel debug
- --logLevel=debug
- --logLevel = debug
- --logLevel debug

Info (Default)
- logLevel=info
- logLevel = info
- logLevel info
- -logLevel=info
- -logLevel = info
- -logLevel info
- --logLevel=info
- --logLevel = info
- --logLevel info

Warn
- logLevel=warn
- logLevel = warn
- logLevel warn
- -logLevel=warn
- -logLevel = warn
- -logLevel warn
- --logLevel=warn
- --logLevel = warn
- --logLevel warn

Error
- logLevel=error
- logLevel = error
- logLevel error
- -logLevel=error
- -logLevel = error
- -logLevel error
- --logLevel=error
- --logLevel = error
- --logLevel error
