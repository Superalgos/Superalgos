<template>
    <div id="github-info-div" >
        <div id="github-info-username-div" >
            <label id="github-info-username-label" for="githubUsername">GitHub Username:</label>
            <input type="text" name="githubUsername" id="github-info-username-input" v-model="githubUsername">
        </div>
        <div id="github-info-token-div">
            <label id="github-info-token-label" for="githubToken">GitHub Token:</label>
            <input type="text" name="githubToken" id="github-info-token-input" size="40" v-model="githubToken">
        </div>
        <div id="github-update-button-div">
            <input id="github-update-button" type="button" value="Update Info" v-on:click="updateGithubProfile">
        </div>
        <p class="center small">Please allow 5 minutes for update.</p>
        </div>
</template>

<script>
export default {
    name: 'github-info-component',
    data() {
        return {
            githubUsername: undefined,
            githubToken: undefined
        }
    },
    methods: {
        updateGithubProfile() {
            alert("TODO: Add endpoint to update token.")
        }
    }

}
</script>

<style>
/* GitHub User Info Input */
#github-info-main-div {
    width: 100%;
    height: 90%;
    display: flex;
}
#github-info-div {
    border: solid 2px black;
    border-radius: 18px;
    width: fit-content;
    margin: auto;
    padding: 2%;
}
#github-info-username-div {
    display: grid;
    grid-template-columns: 1fr 2fr;
    grid-template-areas:
    'username-label username-input'
}
#github-info-username-label {
    grid-area: username-label;
    text-align: right;
    margin-right: 5px;
    font-size: 22px;
    font-weight: bold;
}
#github-info-username-input {
    grid-area: username-input;
}
#github-info-token-div {
    display: grid;
    grid-template-columns: 1fr 2fr;
    grid-template-areas:
    'token-label token-input';
    margin-top: 1%;
}
#github-info-token-label {
    grid-area: token-label;
    text-align: right;
    margin-right: 5px;
    font-size: 22px;
    font-weight: bold;
}
#github-info-token-input {
    grid-area: token-input;
}
#github-update-button-div {
    display: flex;
    justify-content: center;
    margin-top: 2%;
}
#github-update-button {
    font-size: 25px;
}
.small {
    font-size: 15px;
}
</style>