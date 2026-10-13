<template>

  <v-row no-gutters>
    <v-list>
      <v-list-item
        v-for="entity in myEntities"
        :key="entity"
        @click.stop="showUserProfile(entity)"
        router :to="links.route"
        class="ml-n4"
      >
        <v-row>
            <!-- Avatar Column -->
            <v-col justify-center align-centerv-if="entity && entity.avatar" cols="auto">
              <v-list-item :prepend-avatar="entity.avatar" class="avatar-item"></v-list-item>
            </v-col>

            <!-- Handle & Bio Column -->
            <v-col>
              <div class="title-wrapper">
                <!-- Handle -->
                <v-list-item v-if="entity && entity.handle">
                  <div>
                    <div>{{ entity.handle }}</div>
                    <div v-if="entity.bio" class="text-caption text-grey-darken-1">
                      {{ entity.bio }}
                    </div>
                  </div>
                </v-list-item>

                <!-- No Profile Message -->
                <v-list-item v-else>
                  {{ entity.handle }} <span>doesn't have a Profile yet</span>
                </v-list-item>
              </div>
            </v-col>
        </v-row>
      </v-list-item>
    </v-list>
  </v-row>
     
</template>
    
<script>
    
export default {
  data() {
    return{
      selectedEntity: null,
      links: {
        route: '/portfolio'
      },
      showDialog: false,
    }
  },
  computed: {
    myEntities() {
      return this.$store.getters['personas/allPersonas'];
    },      
  },
  methods: {
    showUserProfile(entity) {
      this.showUser = true;
      this.$store.dispatch('personas/setSelectedUser', entity)
      this.$store.dispatch('personas/showUserProfile', this.showUser)
    },
  },   
}
</script>
    
<style>
  .avatar-item {
    max-width: 20px; /* Ensure avatar doesn't take too much space */
  }
</style>
