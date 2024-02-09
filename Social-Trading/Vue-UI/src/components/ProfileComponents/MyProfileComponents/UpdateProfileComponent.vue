<template>
<div>
    <div class="update-profile-option">
        <label class="update-profile-labels" for="name">Name: </label>
        <input type="text" name="name" id="name-input" v-model="profileData.name" :placeholder="$store.state.profile.name">
    </div>
    <div class="update-profile-option">
        <label class="update-profile-labels" for="bio">Bio: </label>
        <textarea name="bio" id="bio-text-area" cols="60" rows="5" v-model="profileData.bio"></textarea>
    </div>
</div>
</template>

<script>
import store from '../../../store/index';
import { updateProfile } from '../../../services/ProfileService'
export default {
    name: 'update-profile-component',
    data() {
        return {
            profileData: {
                name: '',
                bio: ''
            }
        }
    },
    methods: {
        sendProfileUpdate() {
            let message = this.profileData;
            message.profilePic = this.imageSrc;
            message.originSocialPersonaId = store.state.profile.nodeId;
            message.bannerPic = this.bannerImageSrc;
            updateProfile(JSON.stringify(message))
            .then(response => {
                console.log(response.data)
                // TODO check OK response.
            })
        },
    },
    computed: {
        imageSrc() {
            return store.state.profile.profilePic;
        },
        isUpdatingProfileData() {
            return store.state.updatingProfile;
        },
        bannerImageSrc() {
            return store.state.profile.bannerPic;
        }
    },
    watch: {
        isUpdatingProfileData(newValue, oldValue) {
            if (newValue === true) {
                this.sendProfileUpdate();
                store.commit("UPDATING_PROFILE", false);
            }
        }
    },
    created() {
        this.profileData.bio = store.state.profile.bio;
        this.profileData.name = store.state.profile.name;
    }

}
</script>

<style>

</style>