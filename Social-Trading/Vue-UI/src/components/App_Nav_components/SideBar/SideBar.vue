<template>
  
  <v-navigation-drawer
    v-if="isDrawer"
    :model-value="open"
    @update:model-value="$emit('update:open', $event)"
    temporary
    app
  >
   
    <v-card class="mt-2">
      <v-divider></v-divider>
        <v-list>
          <v-list-item 
            v-for="(item, i) in items" 
            :key="i" 
            :value="item" 
            color="red-lighten-1" 
            rounded="shaped" 
            link :to="item.to" 
            class=""
            :title="item.title"
          >
            <template v-slot:prepend>
              <v-icon size="32" :icon="item.icon"></v-icon>
            </template>
                
          </v-list-item>
        </v-list>
    </v-card>
  </v-navigation-drawer>

  <v-card
    v-else
    
  >
    <v-card>
      <v-card-title>Nav</v-card-title>
      
    </v-card>
    <v-card class="mt-2">
      <v-divider></v-divider>
        <v-list>
          <v-list-item 
            v-for="(item, i) in items" 
            :key="i" 
            :value="item" 
            color="red-lighten-1" 
            rounded="shaped" 
            link :to="item.to" 
            class=""
            :title="item.title"
          >
            <template v-slot:prepend>
              <v-icon size="32" :icon="item.icon"></v-icon>
            </template>
                
          </v-list-item>
        </v-list>
    </v-card>
  </v-card>
       
</template>

<script>
export default {
  name: 'SideBar',
  props: {
    open: Boolean,
  },
  data() {
    return {
      items: [
        {
          icon: 'mdi-home',
          title: 'Home',
          to: '/'
        },
        {
          icon: 'mdi-view-dashboard',
          title: 'Dashboard',
          to: '/dashboard'
        },
        {
          icon: 'mdi-chart-bar',
          title: 'Charts',
          to: '/charts'
        },
        {
          icon: 'mdi-chart-arc',
          title: 'Portfolio',
          to: '/portfolio'
        },
        {
          icon: 'mdi-account-group-outline',
          title: 'Users',
          to: '/users'
        },
        {
          icon: 'mdi-checkbox-marked-circle-outline',
          title: 'Todos',
          to: '/todos'
        },
        {
          icon: 'mdi-account-network-outline',
          title: 'Networks',
          to: '/networks'
        },
        {
          icon: 'mdi-walk',
          title: 'Follow',
          to: '/followers'
        },
        

      ],
    }
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
