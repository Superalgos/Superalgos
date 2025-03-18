<template>
    <v-navigation-drawer
      v-if="isDrawer"
      :model-value="open"
      @update:model-value="$emit('update:open', $event)"
      
      temporary
      location="right"    
      app
    >
      <v-card>
        <v-card-title>My Entities</v-card-title>
        <MyEntites />
      </v-card>
      
        <v-card class="mt-2">
            <V-card-title>Trends for you</V-card-title>
            <v-card-item>
              <Users />
          <div>
            <div class="text-caption">
             Trending Trades 
            </div>
            <div class="text-h6 mt-n3">
              User name
            </div>
            <div class="text-caption mt-n2">ROI</div>
            <div class="text-caption mt-n1">Number of Trades</div>
          </div>
        </v-card-item>
    
        </v-card>
        <v-card  >
        <v-card-title>All SA S.Entities</v-card-title>
      </v-card>
    </v-navigation-drawer>  
  
    <v-card v-else>
      
      <v-card>
        <v-card-title>My Entities</v-card-title>
        <MyEntites />
      </v-card>
      
        <v-card class="mt-2">
            <V-card-title>Trends for you</V-card-title>
            <v-card-item>
          <div>
            <div class="text-caption">
             Trending Trades 
            </div>
            <div class="text-h6 mt-n3">
              User name
            </div>
            <div class="text-caption mt-n2">ROI</div>
            <div class="text-caption mt-n1">Number of Trades</div>
          </div>
        </v-card-item>
    
        </v-card>
        <v-card  >
        <v-card-title>All SA S.Entities</v-card-title>
        </v-card>
    </v-card>    
  </template>
    
    <script>
    import MyEntites from './MyEntities/MyEntities.vue'
    export default {
      name: 'TrendForYOu',
      components: {
        MyEntites,
         },
      props: {
        open: Boolean,
      },
      computed: {
        drawer: {
          get() {
            return this.open;
          },
          set(value) {
            this.$emit("update:open", value);
          },
        },
        isDrawer() {
          return this.$vuetify.display.smAndDown; // Uses drawer on small screens
        },
      }
  
    
    }
    </script>
    
    <style>
    
    </style>
