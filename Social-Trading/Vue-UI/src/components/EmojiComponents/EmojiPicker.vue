<template>
  <div class="emoji-picker" v-bind:style="{ top: (location.y + 20) + 'px', left: (location.x - 20) + 'px' }" >
    <div v-for="(emoji, index) in emojis" v-bind:key="index" class="emoji-item" @click="selectEmoji(emoji)">
      {{ emoji }}
    </div>
  </div>
</template>

<script>
import store from '../../store/index'
import EmojiList from '../../../utils/EmojiList'

export default {
  name: 'EmojiPicker',
  props: ['postReaction', 'location', 'originSocialPersonaId', 'originPostHash', 'message'],
  data() {
    return {
      emojis: EmojiList
    }
  },
  methods: {
    selectEmoji(emoji) {
        store.commit("SET_SELECTED_EMOJI", `${emoji}`);
        store.commit("SHOW_EMOJI_PICKER_NEW_POST", false);
    }
  }
}
</script>

<style>
.emoji-picker {
  display: flex;
  flex-wrap: wrap;
  position: absolute;
  justify-self: center;
  border: solid 3px black;
  width: 350px;
  height: 200px;
  overflow: hidden;
  overflow-y: auto;
  background: white;
  top: 235px;
  left: 605px;
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