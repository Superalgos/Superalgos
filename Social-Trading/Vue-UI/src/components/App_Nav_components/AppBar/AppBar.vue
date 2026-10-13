<template>
  <v-app-bar
            app
            color="white"
            image=""
            prominent
            flat
        >
            <template v-slot:image>            
            <v-img
                gradient="to top right, (255, 255, 255, 0) 0%, 255, 255, 255, 1) 100%)"
            ></v-img>
            </template>
        <!--Drawer Btn-->
            <template v-slot:prepend><!--Superalgos Log with Name-->
            <v-icon
            size="52"
            class="ml-4"
            v-if="showNavIcon" 
            >
            <v-img 
                src="./src/assets/superalgos.png"
                
                
                >
            </v-img>
            </v-icon>
            <v-app-bar-nav-icon 
              color="" 
              v-if="showNavIcon" 
              @click="$emit('toggle-sidebar')"
            ></v-app-bar-nav-icon> 
            </template> 

          <v-img 
              src="./src/assets/superalgos-logo.png"
              class="hide-on-small "
              v-if="!showNavIcon" 
            ></v-img>

          <!--App Name-->
        <v-app-bar-tilte 
          color="primary" 
          class="app-title"
          
        >Social Trading</v-app-bar-tilte>
        <v-spacer></v-spacer>
        
                    
      <!--Select Avatar, a part where you can change your Social Persona-->
      
  <div class="text-center" 
      >
    <v-menu
      location="bottom"
      
    >
     <!--The avatar-->
      <template v-slot:activator="{ props }">
        <v-avatar
          color="black"
          v-bind="props"
          class="mr-4"
        >
          <v-img :src="selectedSocialPersona?.avatar" />
        </v-avatar>
      </template>

            <v-card 
              min-width="300"
              class="mt-1"
            >
              <!--My List of social Personas-->
              <v-list
                    color="blue"
                    >
                    <v-list-item-title>Select Persona</v-list-item-title>
                      <v-list-item
                        v-for="socialPersona in socialPersonasFromStorage"
                        :key="socialPersona.originSocialPersonaId"
                        :prepend-avatar= socialPersona.avatar
                        :title= socialPersona.handle  
                        :subtitle= socialPersona.bio
                        @click="accountChange(socialPersona)" 
                        
                      >
                      
                        <template v-slot:append>
                          <v-radio
                            :class="{
                              'text-red': socialPersona === selectedSocialPersona,
                              'text-black': socialPersona !== selectedSocialPersona
                            }"
                          ></v-radio>
                        </template> 
                      </v-list-item>
              </v-list>

              <v-divider class="mb-2"></v-divider>

              <!--Create new Persona button-->
              <v-card color="primary" class="mx-4 mb-2">
                      <v-btn 
                        class="d-flex justify-center text-h6 " 
                        flat 
                        color="red" 
                        prepend-icon="mdi-plus"
                        @click="handleCreateNewSocialPersona"
                      >New Persona</v-btn> 
              </v-card>
              
            </v-card>
    </v-menu>
  </div>

        <!--Form overlay-->
          <v-overlay 
            v-model="showForm"
            class="d-flex justify-center align-center">
            <Form 
              :fields="fields"
              :form-data="formFields"
              title="new Profile"
              @save-card="saveCard"
              @close-form="closeForm"
            />
          </v-overlay>

    </v-app-bar>
</template>

<script>
import { mapActions } from 'vuex';
import Form from '../../utils/Form.vue'
export default {
  components: {
    Form
  },
  props: {
    selectedSocialPersona: Object
    },
  data() {    
    return {
      showForm: false,
        fields: [
                { label: 'Social handle', value: '', name: "handle" },
                { label: 'GitHub UserName', value: '', name: "githubUsername" },
                { label: 'GitHub Acess Token', value: '', name: "gitToken" },
                { label: 'Wallet Address', value: '', name: "address" },
                { label: 'Private Key', value: '', name: "privateKey" },
              
              ],
        formData: {},
        formFields: {},
        githubUsername: '',
        gitToken: '',
    }
  },
  methods: {
    handleCreateNewSocialPersona() {
          this.showForm = true
         // console.log('You are going to add a new social Persona')
        } ,
    closeForm() {
          this.showForm = false
    },
    ...mapActions({
      setPersona: 'personas/setSelectedSocialPersona'  
    }),
    accountChange(socialPersona) {
      this.setPersona(socialPersona)
    },
    saveCard(formData, avatarPreviewUrl, coverImgPreviewUrl ) {
      // Save the edited data of the selected card and close the modal dialog
        if (!formData) {
          return {};
        }
        this.showForm = false

        const { handle, address,privateKey,  githubUsername, gitToken } = formData
                    
        this.newProfile = {
          ...this.formData,
          handle,
          address,
          privateKey, 
          githubUsername,
          gitToken,
        }
        //console.log('Card Data', this.newProfile )
        this.$store.dispatch('personas/addNewProfile', this.newProfile);
        return { 
          handle,
          githubUsername,
          gitToken,
          address
        }

    },     
  },
  computed: {
    
    socialPersonasFromStorage() {

     let response = this.$store.getters['personas/socialPersonasFromStorage'];
     let personas = [];

            for (let i = 0; i < response.length; i++) {
              let myPersonas = response[i];

              if(myPersonas.result === 'Ok' && myPersonas.profileData) {
                personas.push(myPersonas.profileData);
              }
            }
           // console.log('social Personas From Storage getters in App', personas )

                return personas;
    },
    
    showNavIcon() {
      return this.$vuetify.display.smAndDown;
    },
  },
      

}
</script>

<style>

</style>
