<template>
    <!-- Logout Div (bottom left) -->
    <div class="logout-div">
        <img class="smaller-profile-pic " v-bind:src="imageSrc" alt="">
        &nbsp;
            <div id="handle-and-social-persona" title="Login / Logout" class="center-up">
                <p class="login-text scaling-text"> <strong> {{getUserProfileHandle}} </strong> </p>
                <p class="login-text scaling-text">@{{$store.state.profile.nodeCodeName}}</p>
            </div>
        <img src="../assets/iconmonstrHorizontalMenuIcon.png" alt="Add Image" class="logout-div-menu-icon">
    </div>
</template>

<script>
import store from '../store/index'

export default {
    name: "logout-component",
    data() {
        return {

        }
    },
    computed: {
        imageSrc() {
            return store.state.profile.profilePic;
        },
        getUserProfileHandle() {
            let userHandle = store.state.profile.userProfileHandle;

            if (userHandle !== undefined) {
                if (userHandle.length !== undefined) {
                    if (userHandle.length > 16) {
                        return userHandle.slice(0, 16) + "...";
                    }
                } else {
                    // userHandle is defined but has no defined length...
                    console.log("[WARN] - LogoutComponent.vue - getUserProfileHandle -- User Handle is Defined but has no Defined Length.");
                    return userHandle;
                }
            }
            return userHandle;
        },
        getSocialPersonaHandle() {
            let persona = store.state.profile.nodeCodeName
            if (persona !== undefined) {
                if (persona.length !== undefined) {
                    if (persona.length > 16) {
                        return persona.slice(0, 16) + "...";
                    }
                } else {
                    console.log("[WARN] - LogoutComponent.vue - getSocialPersonaHandle -- Persona Handle is Defined but has no Defined Length.");
                    return persona;
                }
            }
            return persona;
        }
    }
}
</script>

<style>
/* Main Div */
.logout-div {
    grid-area: left-panel;
    position: fixed;
    bottom: 0%;
    margin-left: 8%;
    margin-bottom: 2px;
    display: flex;
    padding: 3px;
}
.logout-div:hover {
    border-top-right-radius: 15px;
    border-top-left-radius: 15px;
    border-bottom-left-radius: 15px;
    border-bottom-right-radius: 15px;
    background-color: rgba(182, 182, 182, 0.281);
    width: fit-content;
    cursor: pointer;
}
/* 3 dots image at end */
.logout-div-menu-icon {
    width: 2vw;
    height: 2vw;
    align-self: center;
}
/* Div holding text */
#handle-and-social-persona {
    display: flex;
    flex-direction: column;
    text-align: center;
}
/* Text */
.login-text {
    margin: 0px 3px 0px 5px;
}
/* Image */
.smaller-profile-pic {
    width: 2.5vw;
    height: 2.5vw;
    border-radius: 100%;
    border: solid 1px black;
    align-self: center;
}
</style>