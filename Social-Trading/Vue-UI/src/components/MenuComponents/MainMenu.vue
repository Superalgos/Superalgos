<template>
<div>
    <!-- Menu Header Logo -->
    <div id="menu-head-logo-div">
        <img class="logo" src="../../assets/superalgos-logo.png" >
    </div>
    <div class="menu-btns-div">
        <!-- Home Menu Button -->
        <div class="social-app-home-btn">
            <p class="menu-btn-text" v-on:click="openFeed">
                <img src="../../assets/iconmonstrHomeIcon.png" alt="Home Menu Icon" class="menu-icon">
                &nbsp;Home
            </p>
        </div>
        <!-- Profile Menu Button -->
        <div class="social-app-home-btn">
            <p class="menu-btn-text" @click="openProfile">
                <img src="../../assets/iconmonstrProfileIcon.png" alt="Profile Menu Icon" class="menu-icon">
                &nbsp;Profile
            </p>
        </div>
        <!-- Wallet Menu Button -->
        <div class="social-app-home-btn">
            <p class="menu-btn-text" @click="openWalletPanel">
                <img src="../../assets/iconmonstrWalletIcon.png" alt="Profile Menu Icon" class="menu-icon">
                &nbsp;Wallet
            </p>
        </div>
        <!-- Settings Menu Button -->
        <div class="social-app-home-btn">
            <p class="menu-btn-text" @click="openSettingsPanel">
                <img src="../../assets/iconmonstrSettingsIcon.png" alt="Settings Menu Icon" class="menu-icon">
                &nbsp;Settings
            </p>
        </div>
    </div>
</div>
</template>

<script>
import store from '../../store/index'
import { getFeed } from '../../services/PostService'
export default {
    name: 'main-menu',
    data() {
        return {

        }
    },
    methods: {
        openFeed() {
            getFeed();
            store.commit("SHOW_POSTS_COMMENTS", false);
        },
        openProfile() {
            store.commit("SHOW_PROFILE", true);
        },
        openWalletPanel() {
            store.commit("SHOW_WALLET", true);
        },
        openSettingsPanel() {
            store.commit("SHOW_SETTINGS", true);
        },
    }
}
</script>

<style>

.menu-btns-div {
    display: flex;
    flex-direction: column;
    width: 100%;
    justify-items: right;
}
.menu-btn-text {
    display: flex;
    font-size: 25px;
    font-weight: 700;
    align-content: center;
    padding-left: 20px;
    padding-right: 20px;
}
.menu-btn-text:hover {
    padding-left: 20px;
    padding-right: 20px;
    border-top-right-radius: 15px;
    border-top-left-radius: 15px;
    border-bottom-left-radius: 15px;
    border-bottom-right-radius: 15px;
    background-color: rgba(182, 182, 182, 0.281);
}
.menu-icon {
    width: 30px;
    height: 30px;
    align-self: center;
    margin-right: 10px;
}
.social-app-home-btn {
    display: flex;
    color: black;
    cursor: pointer;
    margin-bottom: 0px;
    margin-top: 8px;
    justify-content: left;
    align-items: center;
    height: 50px;
    width: 100%;
}
.logo {
    height: 60px;
    }

</style>