<template>
    <div class="expandable-tree" >
      <div class="content-div" :style="indent" @click="toggleChildren">
        <!-- if element is showing show a minus sign otherwise show a plus sign -->
        <span class="is-expanded" v-if="this.showChildren">&#8722;</span>
        <span class="is-expanded" v-else>&#43;</span>
        <!-- Check if value is an array, because otherwise we do not have a proptery name to display -->
        <span class="property-name">{{ name }}</span>
        <!-- if value is not an object render it now since recursion stops here-->
        <span class="property-value" v-if="isObject(value) === false"> : {{value}}</span>
      </div>
      <expandable-tree 
        v-if="isObject(value) === true && this.showChildren"
        v-for="(data, name) in value" 
        :value="data" 
        :name="name"
        :key="name"
        :depth="depth + 1"
      >
      </expandable-tree>
    </div>
  </template>

  <script>
    export default { 
      props: [ 'value', 'name', 'depth' ],
      name: 'expandable-tree',
      data() {
        return { 
          showChildren: false
        }
      },
      computed: {
        indent() {
          return { transform: `translate(${this.depth * 50}px)` }
        }
      },
      methods: {
        toggleChildren() {
          this.showChildren = !this.showChildren;
        },
        isObject(value) {
          return typeof value === 'object'
        }
      }
    }
  </script>

  <style scoped>
    .expandable-tree {
      border-style: solid;
      border-width: 3px;
      border-color: rgba(54, 85, 88, .3);
      border-radius: 5px;
      margin: 5px;
      padding: 4px;
      padding-bottom: 7px;
      font-size: 18pt;
      overflow-x: auto;
      overflow-y: hidden;
    }

    .content-div {
      width: fit-content;
      cursor: pointer;
    }
    
    .is-expanded {
      background-color: #365558;
      border-style: solid;
      border-width: 2px;
      border-color: #0295aa;
      border-radius: 8px;
      padding-left: 0.3em;
      padding-right: 0.3em;
      padding-bottom: 0.15em;
      font-weight: 900;
      color: white;
    }

    .property-name {
      color: #324d50;
      margin-left: 1em;
    }

    .property-value {
      color: blue;
    }
  </style>