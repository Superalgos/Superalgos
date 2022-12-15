# Logging documentation

Superalgos is made of a few apps and logging has been unified to aid debugging.

The Superalgos apps are:

- SA - the core modules
- PL - the core platform app
- TS - the task server
- NT - the network app
- ST - the social trading app
- DS - the dashboards app

Each of these apps has a dedicated global property which has a logger attribute. This attribute loaded from the logger factory and will output logs to the command line and to a series of date stamped files. The logs will be placed in either a direcotory specified by you or the default directory `./Platform/My-Log-Files` this chosen directory will have a subset of folders one for each app:

./Platform/My-Log-Files
  |-- DS
  |   |-- error/%DATE$.log
  |   |-- combined/%DATE$.log
  |-- NT
  |   |-- error/%DATE$.log
  |   |-- combined/%DATE$.log
  |-- PL
  |   |-- error/%DATE$.log
  |   |-- combined/%DATE$.log
  |-- SA
  |   |-- error/%DATE$.log
  |   |-- combined/%DATE$.log
  |-- TS
  |   |-- error/%DATE$.log
  |   |-- combined/%DATE$.log
  |-- ST
      |-- error/%DATE$.log
      |-- combined/%DATE$.log


## Usage

All the loggers use the same factory provider and have the following methods available:

- debug
- info
- warn
- error

To log within the app, please take note of the files folder structure as this will dictate which logger to use. For exmaple if you are editing a file in the SA folder structure and want to add some error logging only use the `SA.logger.error()` function, if you are editing a file in the PL folder structure with some info logging then use the `PL.logger.info()` function.
