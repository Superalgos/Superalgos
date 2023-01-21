<!--TODO: add styles for horizonal tab setting-->
<template>
  <div
    :class="{
      flex: variant === 'horizontal',
    }"
  >
    <ul
      :class="{
        tabContainerVertical: variant === 'vertical',
      }"
    >
      <li v-for="(tab, index) in tabList" :key="index">
        <label class="tab-button" :class="{ isActive: activeTab === index + 1}" :for="`${index}`" v-text="tab" />
        <input style="display:none"
          :id="`${index}`"
          type="radio"
          :name="`${index + 1}-tab`"
          :value="index + 1"
          v-model="activeTab"
        />
      </li>
    </ul>

    <template v-for="(tab, index) in tabList">
      <div :key="index" v-if="index + 1 === activeTab">
        <slot :name="`tabPanel-${index + 1}`" />
      </div>
    </template>
  </div>
</template>

<script>
export default {
  props: {
    tabList: {
      type: Array,
      required: true,
    },
    variant: {
      type: String,
      required: false,
      default: () => "vertical",
      validator: (value) => ["horizontal", "vertical"].includes(value),
    },
  },
  data() {
    return {
      activeTab: 1,
    };
  },
};
</script>

<style scoped>
.flex {
  display: flex;
}

.tabContainerVertical {
  display: flex;
  list-style: none;
  justify-content: space-around;
  padding: 10px;
  margin-left: 5px;
  margin-right: 5px;
  border-bottom: solid 1px #333;
}

.tab-button{
  cursor: pointer;
  padding: 10px;
}

.isActive {
  font-weight: bolder;
  border-bottom: solid 3px #333;
}

</style>
