# Superalgos Plugins Overview

Plugins are different from other areas of this repository, since they may include user data, or other non-source-code data. As such, they've been separated out into sub-modules, with separate permissions and governance flows.

This folder location can be customized using the `PATH_TO_PLUGINS` environmental variable.

This folder contains all of the Plugin directories, each of which is associated with a Project. Since the naming and directory structure of the Projects is not strictly canonical, a mapping file is used to associate each Plugin with it's Project. To add a new Plugin directory, follow these steps:

1. Create a new git repository to contain the Plugin files.
2. Add the Project name and corresponding Plugin name to the `project-plugin-map.json` file. (i.e. "Project": "Plugin")
3. Create a submodule to track the plugin from the main respository (`git submodule add https://github.com/Superalgos/<plugin-name>.git Plugins/<plugin-name>`)

