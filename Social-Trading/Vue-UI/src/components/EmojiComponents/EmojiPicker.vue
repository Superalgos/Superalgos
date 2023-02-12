<template>

  <div v-bind:class="[postReaction ? 'emoji-reaction' : 'emoji-picker']" v-bind:style="{ top: (location.y + 20) + 'px', left: (location.x - 20) + 'px' }" >
    <div v-for="(emoji, index) in emojis" v-bind:key="index" class="emoji-item" @click="selectEmoji(emoji, index)">
      {{ emoji }}
    </div>
  </div>
</template>

<script>
import store from '../../store/index'
import { reactedPost } from '../../services/PostService'
export default {
  name: 'EmojiPicker',
  props: ['postReaction', 'location', 'originSocialPersonaId', 'originPostHash'],
  data() {
    return {
      
      
  // If you want more emoji's, add more here!!!
emojis: {
  1: '😀',
  2: '😃',
  3: '😄',
  4: '😁',
  5: '😆',
  6: '😅',
  7: '😂',
  8: '🤣',
  9: '☺️',
  10: '😊',
  11: '😇',
  12: '🙂',
  13: '🙃',
  14: '😉',
  15: '😌',
  16: '😍',
  17: '😘',
  18: '😗',
  19: '😙',
  20: '😚',
  21: '😋',
  22: '😛',
  23: '😝',
  24: '😜',
  25: '🤪',
  26: '🤨',
  27: '🧐',
  28: '🤓',
  29: '😎',
  30: '🤩',
  31: '🥳',
  32: '😏',
  33: '😒',
  34: '😞',
  35: '😔',
  36: '😟',
  37: '😕',
  38: '🙁',
  39: '☹️',
  40: '😣',
  41: '😖',
  42: '😫',
  43: '😩',
  44: '😤',
  45: '😠',
  46: '😡',
  47: '🤬',
  48: '🤯',
  49: '😳',
  50: '😱',
  51: '😨',
  52: '😰',
  53: '😥',
  54: '😢',
  55: '😭',
  56: '😓',
  57: '😪',
  58: '😴',
  59: '🙄',
  60: '🤔',
  61: '🤫',
  62: '🤭',
  63: '🤔',
  64: '🤐',
  65: '🤨',
  66: '😶',
  67: '😐',
  68: '😑',
  69: '😬',
  70: '🙃',
  71: '😯',
  72: '😦',
  73: '😧',
  74: '😮',
  75: '😲',
  76: '😵',
  77: '🤐',
  78: '😷',
  79: '🤒',
  80: '🤕',
  81: '🤢',
  82: '🤮',
  83: '🤧',
  84: '😇',
  85: '🤠',
  86: '🤡',
  87: '🤥',
  88: '🤫',
  89: '🤭',
  90: '🧐',
  91: '🤓',
  92: '😈',
  93: '👿',
  94: '👹',
  95: '👺',
  96: '💀',
  97: '☠️',
  98: '👻',
  99: '👽',
  100: '👾',
  101: '🤖',
  102: '💩',
  103: '😺',
  104: '😸',
  105: '😹',
  106: '😻',
  107: '😼',
  108: '😽',
  109: '🙀',
  110: '😿',
  111: '😾',
  112: '🙈',
  113: '🙉',
  114: '🙊'
}
    }
  },
  methods: {
    selectEmoji(emoji, index) {
        if (this.postReaction) {
          console.log("SETTING EMOJI REACTION KEY")

          // store.commit('SET_EMOJI_REACTION_KEY', index);
          // Store the selected posts hash for other components to use.
          store.commit("SET_EMOJI_ORIGIN_POST_HASH", this.originSocialPersonaId)
          store.commit("SHOW_EMOJI_PICKER", false);

          let reactWithEventType = 700 + index;
          // Build our message to make the reaction
          let message = {
                originSocialPersonaId: store.state.profile.nodeId,
                targetSocialPersonaId: this.originSocialPersonaId,
                postHash: this.originPostHash,
                eventType: reactWithEventType,
            }
            // Send the reaction
            reactedPost(message)
            .then(response => {
                let responseData = response.data
                // Check for Success
                if (responseData.result === "Ok") {
                    store.commit("SHOW_EMOJI_PICKER", false);
                }
                });

        } else {
          store.commit("SET_SELECTED_EMOJI", `${emoji}`);
          store.commit("SHOW_EMOJI_PICKER", false);
        }
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

.emoji-reaction {
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