<template>
  <div class="emoji-picker">
    <div v-for="emoji in emojis" v-bind:key="emoji" class="emoji-item" @click="selectEmoji(emoji)">
      {{ emoji }}
    </div>
  </div>
</template>

<script>
import store from '../../store/index'
export default {
  name: 'EmojiPicker',
  data() {
    return {
      // If you want more emoji's, add more to this array!
      emojis: ['😀', '😃', '😄', '😁', '😆', '😅', '😂', '🤣', '☺️', '😊', '😇', '🙂', '🙃', '😉', '😌', '😍', '😘', '😗', '😙', '😚', '😋', '😛', '😝', '😜', '🤪', '🤨', '🧐', '🤓', '😎', '🤩', '🥳', '😏', '😒', '😞', '😔', '😟', '😕', '🙁', '☹️', '😣', '😖', '😫', '😩', '😤', '😠', '😡', '🤬', '🤯', '😳', '😱', '😨', '😰', '😥', '😢', '😭', '😓', '😪', '😴', '🙄', '🤔', '🤫', '🤭', '🤔', '🤐', '🤨', '😶', '😐', '😑', '😬', '🙃', '😯', '😦', '😧', '😮', '😲', '😵', '🤐', '😷', '🤒', '🤕', '🤢', '🤮', '🤧', '😇', '🤠', '🤡', '🤥', '🤫', '🤭', '🧐', '🤓', '😈', '👿', '👹', '👺', '💀', '☠️', '👻', '👽', '👾', '🤖', '💩', '😺', '😸', '😹', '😻', '😼', '😽', '🙀', '😿', '😾', '🙈', '🙉', '🙊']
    }
  },
  methods: {
    selectEmoji(emoji) {
        // do something with the selected emoji
        console.log(`Emoji selected: ${emoji}`)
        store.commit("SET_SELECTED_EMOJI", `${emoji}`);
        store.commit("SHOW_EMOJI_PICKER", false);
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