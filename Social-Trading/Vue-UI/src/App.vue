<template>
  <v-app>
    <!-- App Bar -->
    <AppBar 
      @toggle-sidebar="sidebarOpen = !sidebarOpen" 
      :selectedSocialPersona="selectedSocialPersona" 
    />
    />
    <v-row>
      
      <!-- Left Spacer (Only on Pages with Extra Columns) -->
      <v-col v-if="isLargeScreen && hasExtraColumns" md="1" lg="2" xl="2"></v-col>
       
      >
        <!-- Sidebar (Drawer for Small Screens, Column for Large Screens) -->
        <template v-if="useDrawer">
          <SideBar  v-if="useDrawer" :open="sidebarOpen"  @update:open="sidebarOpen = $event" />
        </template>
        
        <v-col v-else md="3" lg="2" xl="2">
          <SideBar />
        </v-col>
     
      <!-- Main Content -->
      <v-col class="main-content">
        <v-main>
          <router-view v-slot="{ Component }" :selectedSocialPersona="selectedSocialPersona">
      <component :is="Component" :selectedSocialPersona="selectedSocialPersona" />
    </router-view>
        </v-main>
      </v-col>
      
        <!-- Right Sidebar (Only on Large Screens) -->
        <v-col v-if="isLargeScreen" md="3" lg="2" xl="2">
          <RightSideBar />
        </v-col>
        <!-- Right Sidebar Handle (Only on Mobile) -->
        <div v-if="isMobile" class="right-sidebar-handle" @click="toggleRightSidebar"></div>

        <RightSideBar v-if="isMobile" :open="rightSidebarOpen"  @update:open="rightSidebarOpen = $event" />

        <!-- Right Spacer (Only on Pages with Extra Columns) -->
        <v-col v-if="isLargeScreen && hasExtraColumns" md="1" lg="2" xl="2"></v-col>
     
    </v-row>
    
    
    
    <Footer />
  </v-app>
</template>

<script>
import AppBar from './components/App_Nav_components/AppBar/AppBar.vue'
import Footer from './components/App_Nav_components/Footer/Footer.vue';
import SideBar from './components/App_Nav_components/SideBar/SideBar.vue';
import RightSideBar from './components/App_Nav_components/RightSideBar/RightSideBar.vue';
import { useRoute } from 'vue-router';

export default {
  name: 'App',
  components: {
    AppBar,
    SideBar,
    RightSideBar,
    Footer
  },

  data() {
    return {
      sidebarOpen: false, // Default to open on large screens
      rightSidebarOpen: false,
    };
  },
  computed: {
    isMobile() {
      return this.$vuetify.display.smAndDown; // True for sm and xs screens
    },
    isLargeScreen() {
      return this.$vuetify.display.mdAndUp;
    },
    hasExtraColumns() {
      return useRoute().meta.hasExtraColumns;
    },
    useDrawer() {
      const route = useRoute();
      return this.isMobile && route.meta.useDrawerOnMobile; // Only use v-navigation-drawer when needed
    },
    selectedSocialPersona: {
          get() {
              return this.$store.getters['personas/selectedSocialPersona'];
            }
        },
  },
  watch: {
    isMobile(newVal) {
      if (!newVal) {
        // If moving to a larger screen, ensure sidebar & rightSidebar are closed
        this.sidebarOpen = false;
        this.rightSidebarOpen = false;
      }
    },
  },
  created() {
    this.$store.dispatch('personas/initializeSelectedPersona') 
  },  
  mounted() {
    this.$store.dispatch('personas/fetchEntities')
    //  console.log('The Store State properties:', this.$store.state);
  },
  methods: {
    toggleSidebar() {
      if (this.isMobile) {
        this.sidebarOpen = !this.sidebarOpen;
      }
    },
    toggleRightSidebar() {
      if (this.isMobile) {
        this.rightSidebarOpen = !this.rightSidebarOpen;
      }
    },
  },
  
}
</script>

<style scoped>
.main-content {
  flex-grow: 1; /* Ensures v-main expands properly */
  min-width: 0; /* Prevents layout issues */
}

.right-sidebar-handle {
  position: fixed;
  right: 0;
  top: 50%;
  width: 5px;
  height: 100px;
  background: gray;
  cursor: pointer;
}

.app-container {
  height: 100vh; /* Full viewport height */
  overflow: hidden; /* Prevents scrolling on entire page */
}

.main-content {
  display: flex;
  flex-direction: column;
  height: 100vh;
  overflow-y: auto; /* Only `<v-main>` scrolls */
}
</style>
