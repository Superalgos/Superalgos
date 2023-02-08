<template>
    <div class="modal-overlay" v-if="getVisibility">

        <form class="pop-up-form create-profile-grid" @submit.prevent="createNewProfile">
            <p id="create-profile-title">Create Profile</p>
            
                <!-- GitHub Username -->
                <label id="create-profile-username-label" for="githubUsername">GitHub Username:</label>
                <input id="create-profile-username-input" type="text" name="githubUsername" size="30" v-model="githubUsername">
                
                <!-- GitHub Token -->
                <label id="create-profile-token-label" for="gitToken">GitHub Token:</label>
                <input id="create-profile-token-input" type="text" size="30" name="gitToken" v-model="gitToken">

                <!-- Social Persona Name -->
                <label id="create-profile-social-persona-name-label" for="socialPersonaName"> Social Persona Name:</label>
                <input id="create-profile-social-persona-name-input" type="text" name="socialPersonaNameInput" size="30" v-model="socialPersonaName" >

                <!-- Submit Button -->
                <input id="create-profile-submit-btn" type="button" value="Submit" v-on:click="createNewProfile">

                <!-- Checkbox own Wallet -->
                <input id="connect-wallet-chk" type="checkbox" v-model="checked">
                <label for="connect-wallet-chk">Link to Wallet {{ checked }}</label>

                <!-- Abort Button -->
                <input id="create-profile-abort-btn" type="button" value="Abort" v-on:click="abort">
            </form>
        

    </div>
</template>

<script>

import store from '../../../store/index'
import { createProfile } from '../../../services/ProfileService'
import { walletClient } from '../../../services/WalletService'

export default {
    name: 'create-profile',
    data() {
    return {
        githubUsername: '',
        gitToken: '',
        socialPersonaName: '',
        checked: true,
        };
    },
    methods: {
        async createNewProfile() {
            // Prepare to createProfile message
            const appType = "Social Trading Desktop App"
            const gitHubProvider = "Github"
            const userInfo = {
                storageProviderName: gitHubProvider,
                storageProviderUsername: this.githubUsername,
                storageProviderToken: this.gitToken,
                userAppType: appType
            }

            if (this.checked) {
                this.signature = await walletClient(this.githubUsername)
                if (this.signature) {
                    console.log('YOUR SIGNED MESSAGE: ', this.signature)
                    userInfo.userSignature = this.signature
                }
            }
            // Prepare to create social persona
            const message = {
                name: this.socialPersonaName
            }

            // Create profile or update if exists
            createProfile(userInfo, message)

            // Hide the component
            store.commit("SHOW_CREATE_PROFILE", false);

            // cleanup data
            this.username = '';
            this.gitToken = '';
            this.socialPersonaName = '';
            this.signature = '';
        },
        abort() {
            store.commit("SHOW_CREATE_PROFILE", false);
        }
    },
    computed: {
        getVisibility() {
            let v = this.$store.state.showCreateProfile 
            return v;
        }
}
};
</script>

<style>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 9999;
  background-color: rgba(0, 0, 0, 0.4);
  display: flex;
  align-items: center;
  justify-content: center;
}


.pop-up-form {

    background-color: rgb(240, 238, 238);
    border: solid 0.5px rgba(0, 0, 0, 0.479);
    border-radius: 20px;
    padding: 1%;

}

.center {
    text-align: center;
    width: 100%;
    align-items: center;
}

.column {
    display: flex;
    flex-direction: column;
}

.create-profile-grid {
    display: grid;
    grid-template-columns: 1fr 2fr;
    grid-template-areas: 
    'title title'
    'name-label name-input'
    'token-label token-input'
    'persona-name-label persona-name-input'
    'submit-btn submit-btn'
    'abort-btn abort-btn';
}

#create-profile-title {
    grid-area: title;
    text-align: center;
}

#create-profile-username-label {
    grid-area: name-label;
}

#create-profile-username-input {
    grid-area: name-input;
}

#create-profile-token-label {
    grid-area: token-label;
}

#create-profile-token-input {
    grid-area: token-input;
}

#create-profile-social-persona-name-label {
    grid-area: persona-name-label;
}

#create-profile-social-persona-name-input {
    grid-area: persona-name-input;
}

#create-profile-submit-btn {
    grid-area: submit-btn;
}

#create-profile-abort-btn {
    grid-area: abort-btn;
}


</style>