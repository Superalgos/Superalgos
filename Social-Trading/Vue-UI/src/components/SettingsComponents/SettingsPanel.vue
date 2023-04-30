<template>
    <div class="modal-settings-overlay" v-if="getSettingsVisibility">
        <div id="" class="settings" >


            <div class="top-bar">
                <p  class="bold center-header">Settings</p>
                <input class="close-btn" type="button" value="X" v-on:click="closeSettings">
            </div>

            
            
        </div>
    </div>
</template>

<script>

import store from '../../store/index'


export default {
    name: 'settings-panel',
    data() {
    return {
        };
    },
    methods: {
        closeSettings() {
            store.commit("SHOW_SETTINGS", false);
            return store.state.showSettings
        }
    },
    computed: {
        getSettingsVisibility() {
            return store.state.showSettings
        },
        closeWallet() {
            store.commit("SHOW_SETTINGS", false);
            return store.state.showSettings;
        }
}
};
</script>

<style>
.modal-settings-overlay {
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


.settings {
    background-color: rgb(240, 238, 238);
    border: solid 0.5px rgba(0, 0, 0, 0.479);
    border-radius: 20px;
    width: 75vw;
    height: 80vh;
    color: black;
}




</style>