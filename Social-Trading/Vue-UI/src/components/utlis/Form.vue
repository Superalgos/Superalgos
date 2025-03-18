<template>
  <v-container>
    <v-toolbar>
      <v-btn 
        icon
        @click="closeForm"
      >
        <v-icon>mdi-close</v-icon>
      </v-btn>
      <v-toolbar-title >{{ title }}</v-toolbar-title>
      <v-spacer></v-spacer>
      <v-btn  
        color="primary"
        @click="saveCard"
        :disabled="!valid"
      >Save</v-btn>
    </v-toolbar>
    
      <v-card
        width="400"
        >
        <v-form >
          <!-- Cover Image --> 
          <div v-show="coverImg" style="height: 254px;  " >
            <v-img :src="coverImgPreviewUrl || bannerPic"  style="color:gainsboro" >
            <div class="d-flex mt-14 justify-center">
              <v-icon color="primary" class="d-flex  justify-center" @click="selectFile('cover')" left>mdi-camera</v-icon>
            </div>
            </v-img>
            <input type="file" @change="onFileInputChange($event, 'cover')" ref="coverFileInput" style="display: none;">
          </div>
          
            
          <!-- Avatar Image --> 
         
          <div v-if="avatarImg" class=" ml-4 mt-n13 mb-4">
            <v-avatar size="120" color="white">
              <v-avatar size="108" style="border: 1px solid grey;">
                
                 
                  <v-img  :src="avatarPreviewUrl || avatar" alt="Avatar Preview">
                  <div class="d-flex mt-10 justify-center">
                  <v-icon   color="gray" @click="selectFile('avatar')" left>mdi-camera</v-icon>
                </div>  
                  </v-img>
                  <input  type="file" @change="onFileInputChange($event, 'avatar')" ref="avatarFileInput" style="display: none;">
                    
              </v-avatar>
            </v-avatar>                 
          </div>

        <v-responsive
              class="mx-4"
              max-width=""
          >
          <v-text-field 
              v-for="(field, index) in fields" 
              :key="index" 
              :label="field.label" 
              v-model="formData[field.name]" 
              clearable
              required
              class="mt-2"
              
              
            />
              <v-snackbar
                v-model="hasSaved"
                :timeout="2000"
                attach
                position="absolute"
                location="bottom left"
              >
                Your profile has been updated
              </v-snackbar>
        
        </v-responsive>
      </v-form>
    </v-card>

  </v-container>


</template>
  
  <script>
import { toBase64, resizeImage } from "../../utils/formatters.js"

  export default {
    name: "Form",
    props: {
      fields: {
      type: Array,
      required: true,
      default: () => []
    },
      title: {
        type: String,
        default: "Form"
      },
      labelName: {
        type: String,
        default: "Name",
      },
      labelEmail: {
        type: String,
        default: "Email",
      },
      labelAvatar: {
        type: String,
        default: "Avatar",
      },
      labelBio: {
        type: String,
        default: "Bio",
      },
      
      submitButtonText: {
        type: String,
        default: "Submit",
      },
      visible: {
      type: Boolean,
      default: true
      },
      socialPersona: {
      type: Object,
      default: () => ({})
      },
      formData: {
          type: Object,
          required: true,
          //default: () => ({ handle: '', bio: '', avatar: '' })
        },
      avatar: {
          type: String,
      },
      bannerPic: {
        type: String
      },
      coverImg: {
      type: Boolean,
      
      },
      avatarImg: {
        type: Boolean,
        
      },

    },
    data() {
      return {
        githubUsername: '',
        gitToken: '',
        socialPersonaName: '',
        wallets: true,
        name: "",
        email: "",
        bio: "",
        address: "",
        privateKey: "",
        avatarPreviewUrl: null,
        coverImgPreviewUrl: null,
        checked: false,
        hasSaved: false,
        isEditing: null,
        rules: [
              value => !!value || 'File is required',
              value => !value || value.size < 2000000 || 'File size must be less than 2MB',
              value => !value || ['image/png', 'image/jpeg', 'image/bmp'].includes(value.type) || 'File must be a PNG, JPEG, or BMP image',
            ],
        formFields: {}
        
      };
    },
    methods: {

      closeForm() {
        this.$emit('close-form');
      },
      save() {
        const formData = this.$refs.socialPersonaForm.formData;
        if(this.selectedSocialPersonaIndex !== undefined) {

          const index = this.selectedSocialPersonaIndex;
          this.socialPersonas[index] = {
          handle: formData.handle,
          bio: formData.bio,
          avatar: formData.avatar,
          bannerPic: formData.bannerPic,          
        };
        }else {
          newProfile = {
          handle: formData.handle,
          bio: formData.bio,
          avatar: this.avatarPreviewUrl,
          bannerPic: this.coverImgPreviewUrl,
          githubUsername: formData.githubUsername,
          gitToken: formData.gitToken
        }
      }    
      
      this.dialog = false;
      this.$toast.success('Social persona saved successfully!');
    },
    selectFile(type) {
      if (type === 'cover') {
        this.$refs.coverFileInput.click();
      }else if (type === 'avatar') {
        this.$refs.avatarFileInput.click()
        
      }
      //console.log('selected file', this.$ref)
    },
      
    

    saveEdit() {
      const index = this.socialPersonas.findIndex((sp) => sp.id === this.editedSocialPersona.id);
      this.socialPersonas[index] = { ...this.editedSocialPersona };
      this.dialogVisible = false;
      this.editedSocialPersona = null;
    },
    saveCard() {
      
      this.$emit('save-card', this.formData, this.avatarPreviewUrl, this.coverImgPreviewUrl );
    },

      async submitForm() {
        // handle form submission logic here
        console.log('Form submitted')
        

        /*
         const appType = "Social Trading Desktop App"
            const gitHubProvider = "Github"
            const userInfo = {
                storageProviderName: gitHubProvider,
                storageProviderUsername: this.githubUsername,
                storageProviderToken: this.gitToken,
                userAppType: appType
            }

            if (this.checked) {
                this.signature = await walletClient(this.githubUsername)
                if (this.signature) {
                    console.log('YOUR SIGNED MESSAGE: ', this.signature)
                    userInfo.userSignature = this.signature
                }
            }
            // Prepare to create social persona
            let profileData = {
              joined: new Date().getTime(), 
              originSocialPersonaId: userInfo.nodeId
            }

            // Create profile or update if exists
            //createProfile(userInfo, message)

            // Hide the component
            //store.commit("SHOW_CREATE_PROFILE", false);

            // cleanup data
            this.username = '';
            this.gitToken = '';
            this.socialPersonaName = '';
            this.signature = '';
        */
        // Prepare to createProfile message
       
      },
    abort() {
      store.commit("SHOW_CREATE_PROFILE", false);
    },

    async onFileInputChange(event, type) {
        try {
          const file = event.target.files[0];
          
          if (file) {
            const resizedImage = await resizeImage(file);
            this.file = resizedImage;
            if (type === 'avatar') {
              this.avatarPreviewUrl = await toBase64(file);
            } else if (type === 'cover') {
              this.coverImgPreviewUrl = await toBase64(file);
            }
            
          } else {
            if (type === 'avatar') {
              this.avatarPreviewUrl = null;
            } else if (type === 'cover') {
              this.coverImgPreviewUrl = nullth
            }
            
          }
        } catch (error) {
          console.error(error);
          this.$toast.error('Failed to process the file. Please try again.');
        }
    }
    },
    computed: {
      valid() {
        switch (this.title) {
          case 'Create Profile':
            if (
              this.formData.handle !== undefined &&
              this.formData.bio !== undefined &&
              this.avatarPreviewUrl !== undefined &&
              this.coverImgPreviewUrl !== undefined
            ) {
              return (
                this.formData.handle &&
                this.formData.bio &&
                this.avatarPreviewUrl &&
                this.coverImgPreviewUrl
              );
            }
            break;

          case 'new Profile':
            if (
              this.formData.handle !== undefined &&
              this.formData.githubUsername !== undefined &&
              this.formData.gitToken !== undefined
            ) {
              return (
                this.formData.handle &&
                this.formData.githubUsername &&
                this.formData.gitToken
              );
            }
            break;
          case 'SA User Profile':
            if (
              this.formData.githubUsername !== undefined &&
              this.formData.gitToken !== undefined &&
              this.formData.address !== undefined &&
              this.formData.privateKey !== undefined
            ) {
              return (
                this.formData.githubUsername &&
                this.formData.gitToken &&
                this.formData.address &&
                this.formData.privateKey
              );
            }
            break;
          case 'Create AppId':
            if (
              this.formData.githubUsername !== undefined &&
              this.formData.gitToken !== undefined &&
              this.formData.address !== undefined &&
              this.formData.privateKey !== undefined
            ) {
              return (
                this.formData.githubUsername &&
                this.formData.gitToken &&
                this.formData.address &&
                this.formData.privateKey
              );
            }
            break;
          case 'Social Persona':
            if (
              this.formData.handle !== undefined &&
              this.formData.githubUsername !== undefined &&
              this.formData.gitToken !== undefined &&
              this.formData.address !== undefined &&
              this.formData.privateKey !== undefined
            ) {
              return (
                this.formData.handle &&
                this.formData.githubUsername &&
                this.formData.gitToken &&
                this.formData.address &&
                this.formData.privateKey
              );
            }
            break;

          default:
            return false;
        }
      },
    },
    created() {
      if(this.coverImgPreviewUrl) {
        this.coverImgPreviewUrl = this.coverImg
      }
      if(this.coverImgPreviewUrl) {
        this.avatarPreviewUrl = this.coverImg
      }
    }
}

  
  </script>
  
