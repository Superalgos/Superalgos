# Superalgos Social Trading App

Welcome to Superalgos Social Trading App! This project is built with:

### Vue UI

### React-UI

### Clean UI


_** This Document and App is Under Development **_







Welcome to Superalgos Social Trading App! This project is built with Vue.js, Vite, and Vuetify.

## Getting Started

To successfully run the app, please follow these preliminary steps:

### Pre-requisites

  1. **Clone the Superalgos Repository:**
    - Copy the entire Superalgos repository to your local machine.

  2. **Setting up Your SocialPersona and UserProfile**

    1. **Create a UserProfile:**
      - If you don't have a UserProfile, follow the "Creating a User Profile" instructions in the Governance workspace.

    2. **Create a GitHub Storage Container:**
      - Add a User-Storage -> Github Storage -> Github Containers -> Open Storage Container.
      - Create a repository in your GitHub account to store your profile, bots, and posts.
      - Store the Open Storage Container configuration:
        ```json
        {
          "storageProvider": "Your-GitHub-UserName",
          "storageContainer": "The-Name-of-Your-Repo"
        }
        ```

    3. **Link Open Storage Reference:**
      - Go back to your UserProfile Node.
      - Add a SocialPersona, Available Storage, and Open Storage Reference.
      - Link the Open Storage Reference to the container you just created.

    4. **Configure SocialTradingDesktopApp Node:**
      - Add a `socialTradingDesktopApp` node to your UserProfile with the following configuration:
        ```json
        {
          "userProfile": {
            "id": "Superalgos Generated",
            "codeName": "GitHub UserName"
          },
          "storageProvider": {
            "name": "Github",
            "userName": "GitHub UserName",
            "token": "GitHub-Token"
          }
        }
      ```

### Running the Project

  1. **Ensure Node.js is Installed:**
    - If you don't have Node.js installed, download and install it from [nodejs.org](https://nodejs.org/).

  2. **Install Project Dependencies:**
    - Open a terminal and navigate to the project directory:
      ```bash
      cd ../Superalgo/Social-Trading/Vue-UI
      ```
    - Install project dependencies:
      ```bash
      npm install
      ```
      -Go Back to the Main directory:
      ```bash
      cd ../../
      ```

  3. **Run the Project:**
    - Type in your console:
      ```bash
      node socialTradingVueDev
      ```
    - This command starts the development server, and you can view the application in the browser.

  4. **Start Developing:**
    - Superalgos Social Trading App is now set up! Explore the source code, make changes, and start building with us on [Telegram](https://t.me/superalgosdevelop/19772).
	
	
	## Development Status

	|**Active**|**Non-Active**|
	|----------|------------|
	|[Vue-UI](#vue-ui)| |
	| |[React-UI](#react-ui)|
	| |[Clean-UI](#clean-ui)|
	
	_Anyone is welcome to start work back up on any non-active UI's at any time._
	
	---


###  Project Structure
	- src/: Contains the source code of the Vue.js application.
    - public/: Contains static assets.

### Available Scripts

    - "install:vue-cli": Checks if @vue/cli is installed globally and installs it if not.
    - "add:vuetify": Checks if Vuetify is installed locally and adds it to the project if not.
    - "start:dev": Prints a message and starts the Vite development server.
    - "dev": Runs the install, add, and start scripts in sequence when the user runs npm run dev/ when you run node socialTradingVue.

### Troubleshooting

     - If you encounter any issues or have questions, please refer to the issue tracker or create a new issue.

### Additional Information

- For more details on Vite, Vue.js, and Vuetify, refer to their official documentation:
	- [Vite](https://vitejs.dev/)
	- [Vue.js](https://vuejs.org/)
	- [Vuetify](https://vuetifyjs.com/)
	  
- Join the development community on Telegram: [Superalgos Development Group](https://t.me/superalgosdevelop/19772)

### Pending Changes and Work in Progress

1. **Unpushed Local Changes:**
   - There are local changes on my development machine that have not yet been pushed to the GitHub repository. I will commit and push these changes soon.

2. **Unconnected Service Functions:**
   - Some functions in the service router are not yet connected to the UI. I'm actively working ON enhance the overall functionality of the application.

---

### Update History

- **Date:** [2023/08/27]
  - RemovePost()

---

### To-Do List



- [ ] Connect the following service functions to the UI:
  - [ ] RemovePost Function
  - [ ] Function 2
  - [ ] Function 3

Happy coding!
