<template>
    <div class="emoji-reaction" v-bind:style="{ top: (location.y + 20) + 'px', left: (location.x - 20) + 'px' }" >
        <div v-for="(emoji, index) in emojiReactions" v-bind:key="index" class="emoji-item" @click="selectEmoji(index)">
        {{ emoji }}
        </div>
    </div>
</template>

<script>
import store from '../../store/index';
import { reactedPost, getFeed } from '../../services/PostService';
import EmojiReactions from '../../../utils/EmojiReactions';

export default {
    name: 'ReactionPicker',
    props: ['postReaction', 'location', 'originSocialPersonaId', 'originPostHash', 'message'],
data() {
    return {
        emojiReactions: EmojiReactions
    }
},
    methods: {
    selectEmoji(index) {
        store.commit("SET_EMOJI_ORIGIN_POST_HASH", this.originSocialPersonaId)
        store.commit("SHOW_EMOJI_PICKER", false);

        let reactWithEventType = 701 + parseInt(index);
        // Build our message to make the reaction
        let message = {
            originSocialPersonaId: store.state.profile.nodeId,
            targetSocialPersonaId: this.originSocialPersonaId,
            postHash: this.originPostHash,
            eventType: reactWithEventType,
        }
        console.log(reactWithEventType);
        // Send the reaction
        reactedPost(message)
            .then(response => {
                let responseData = response.data
                // Check for Success
                if (responseData.result === "Ok") {
                    this.$emit('reaction-sent');
                    getFeed();
                }
            });
        }
    }
}
</script>

<style>

.emoji-reaction {
    display: flex;
    flex-wrap: wrap;
    position: absolute;
    justify-self: center;
    border: solid 3px black;
    width: 350px;
    height: fit-content;
    overflow: hidden;
    overflow-y: auto;
    background: white;
}

.emoji-item {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 32px;
    height: 32px;
    font-size: 24px;
    margin: 4px;
    cursor: pointer;
    border: 1px solid transparent;
    border-radius: 4px;
    transition: all 0.2s ease;
}

.emoji-item:hover {
    background-color: #eee;
    border-color: #ccc;
}

.emoji-item.selected {
    background-color: #6c757d;
    color: white;
}
</style>