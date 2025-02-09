<!-- src/views/Home.vue -->
<template>
  <div class="dashboard-window">
    <img class="image" :src="dashboardIcon" alt="Dashboard Icon">
    <h2><strong>Welcome to the Superalgos Dashboard App!</strong></h2>
    <br/>
    <span>The purpose of this app is to help make visualizing and accessing data from Superalgos a breeze.</span>
    
    <!-- Action Buttons -->
    <div class="row col-12 justify-content-end">
      <div class="col-auto">
        <button class="btnToken btn-primary mb-2" @click="createUserProfile">
          <img :src="newprofileIcon" alt="New Profile" class="icon-button100" />
        </button>
        <button class="btnToken btn-primary mb-2" @click="createDashboard">
          <img :src="newdashboardIcon" alt="New Profile" class="icon-button100" />
        </button>
        <button class="btnToken btn-primary mb-2" @click="connectWallet" :disabled="loadingWallet">
          <img :src="metamaskIcon" alt="MetaMask" class="icon-button100" />
        </button>
        <span v-if="loadingWallet">Connecting...</span>
      </div>
    </div>

    <!-- Favorite Dashboards Section -->
    <div class="favorites-section">
      <h3>Favorite Dashboards</h3>
      <div class="favorite-buttons">
        <button 
          v-for="fav in favoriteDashboards" 
          :key="fav" 
          class="btn btn-secondary m-2" 
          @click="navigateTo(fav)"
        >
          {{ fav }} Dashboard
        </button>
      </div>
    </div>

    <!-- Widgets Section -->
    <div class="widgets-container">
      <div class="widget">
        <h3>Latest Medium Posts</h3>
        <ul>
          <li v-for="post in latestMediumPosts" :key="post.id">
            <a :href="post.url" target="_blank">{{ post.title }}</a>
          </li>
        </ul>
      </div>
      <div class="widget">
        <h3>Latest Twitter Posts</h3>
        <ul>
          <li v-for="tweet in latestTweets" :key="tweet.id">
            <a :href="`https://twitter.com/${tweet.user}/status/${tweet.id}`" target="_blank">{{ tweet.text }}</a>
          </li>
        </ul>
      </div>
      <div class="widget">
        <h3>Links of Interest</h3>
        <ul>
          <li><a href="https://superalgos.org" target="_blank">Superalgos Official Site</a></li>
          <li><a href="https://docs.superalgos.org" target="_blank">Superalgos Documentation</a></li>
          <li><a href="https://github.com/Superalgos/Superalgos" target="_blank">Superalgos GitHub</a></li>
          <!-- Añade más links según sea necesario -->
        </ul>
      </div>
    </div>

    <!-- Mostrar Dirección de Wallet Conectada -->
    <div class="wallet-info" v-if="userWalletAddress">
      <p><strong>Connected Wallet:</strong> {{ userWalletAddress }}</p>
    </div>

    <!-- Social Media Buttons -->
    <div class="text-center col-12">
      <button class="btnToken btn-primary mb-2" @click="buyToken1">
        <img :src="pancakeSwapIcon" alt="PancakeSwap" class="icon-button300" />
      </button>
      <button class="btnToken btn-primary mb-2" @click="buyToken2">
        <img :src="oneInchIcon" alt="1inch" class="icon-button200" />
      </button>
    </div>

    <!-- Additional Social Media Buttons -->
    <div class="text-center col-12">
      <button class="btnToken btn-primary mb-2" @click="navigateTo('Governance')">
        <img :src="superalgosIcon" alt="Governance" class="icon-button200" />
      </button>
      <button class="btnToken btn-primary mb-2" @click="buyToken7">
        <img :src="githubIcon" alt="GitHub" class="icon-button50" />
      </button>
      <button class="btnToken btn-primary mb-2" @click="buyToken5">
        <img :src="telegramIcon" alt="Telegram" class="icon-button50" />
      </button>
      <button class="btnToken btn-primary mb-2" @click="buyToken6">
        <img :src="youtubeIcon" alt="YouTube" class="icon-button50" />
      </button>
      <button class="btnToken btn-primary mb-2" @click="buyToken8">
        <img :src="mediumIcon" alt="Medium" class="icon-button50" />
      </button>
    </div>
    
  </div>
</template>

<script>
import { ethers } from 'ethers'; // Importa ethers.js
import dashboardIcon from "../assets/dashboard.png";
import pancakeSwapIcon from "../assets/pancakeswap-01.svg";
import oneInchIcon from "../assets/1inch.svg";
import superalgosIcon from "../assets/superalgos-logo-black.svg";
import githubIcon from "../assets/github-mark.svg";
import telegramIcon from "../assets/telegramIcon.png";
import youtubeIcon from "../assets/youtubeIcon.png";
import mediumIcon from "../assets/mediumIcon.png";
import metamaskIcon from "../assets/metaMask_Fox.svg";
import newprofileIcon from "../assets/profile-constructor.svg";
import newdashboardIcon from "../assets/dashboard.png";
import axios from 'axios';

export default {
  // Receive incoming data from parent app 
  props: ["incomingData"],

  data () {
    return {
      dataKey: '',
      dataObjects: [],
      dashboardIcon: dashboardIcon,
      pancakeSwapIcon,
      oneInchIcon,
      superalgosIcon,
      githubIcon,
      telegramIcon,
      youtubeIcon,
      mediumIcon,
      metamaskIcon,
      newprofileIcon,
      newdashboardIcon,
      loadingDashboard: false,
      loadingWallet: false, // Añadido
      userWalletAddress: '', // Añadido
      latestMediumPosts: [],
      latestTweets: [],
      favoriteDashboards: []
    }
  },
  computed: {

  },
  methods: {
    createDashboard () {
      const named = window.prompt("Name your New Dashboard");
      if(named){
        // Implementa la lógica para crear un nuevo dashboard
        console.log(`New Dashboard Created: ${named}`);
      }
    },
    createUserProfile () {
      const named = window.prompt("Name your New User Profile");
      if(named){
        // Implementa la lógica para crear un nuevo dashboard
        console.log(`New User Profile Created: ${named}`);
      }
    },
    async connectWallet(){
      this.loadingWallet = true;
      try {
        if (window.ethereum) {
          // Solicitar acceso a la cuenta
          await window.ethereum.request({ method: 'eth_requestAccounts' });

          // Crear un proveedor Ethers
          const provider = new ethers.providers.Web3Provider(window.ethereum);

          // Obtener la signer (firmante)
          const signer = provider.getSigner();

          // Obtener la dirección de la wallet del usuario
          const address = await signer.getAddress();
          this.userWalletAddress = address;
          console.log('Connected wallet:', this.userWalletAddress);

          // Llamar a getAllUserProfiles después de conectar la wallet
          if (typeof this.getAllUserProfiles === 'function') {
            this.getAllUserProfiles();
          } else {
            console.warn('La función getAllUserProfiles no está definida.');
          }
        } else {
          console.error('Non-Ethereum browser detected. Please install MetaMask.');
        }
      } catch (error) {
        console.error('Error connecting wallet:', error);
      } finally {
        this.loadingWallet = false;
      }
    },
    buyToken1(){
      window.open('https://pancakeswap.finance/info/token/0xfb981ed9a92377ca4d75d924b9ca06df163924fd', '_blank');
    },
    buyToken2(){
      window.open('https://app.1inch.io/#/1/simple/swap/USDT/SA', '_blank');
    },
    buyToken3(){
      window.open('https://superalgos.org', '_blank');
    },
    buyToken4(){
      window.open('https://github.com/Superalgos/Superalgos', '_blank');
    },
    buyToken5(){
      window.open('https://telegram.me/superalgos', '_blank');
    },
    buyToken6(){
      window.open('https://youtube.com/superalgos', '_blank');
    },
    buyToken7(){
      window.open('https://medium.com/@superalgos', '_blank');
    },
    buyToken8(){
      window.open('https://medium.com/@superalgos', '_blank'); // Asumiendo que buyToken8 también es para Medium
    },
    navigateTo(dashboardName){
      this.$router.push({ name: dashboardName });
    },
    async fetchLatestMediumPosts(){
      try {
        const response = await axios.get('https://api.rss2json.com/v1/api.json', {
          params: {
            rss_url: 'https://medium.com/feed/@superalgos'
          }
        });
        this.latestMediumPosts = response.data.items.slice(0, 5).map(item => ({
          id: item.guid,
          title: item.title,
          url: item.link
        }));
        console.log('Fetched Medium Posts:', this.latestMediumPosts);
      } catch (error) {
        console.error('Error fetching Medium posts:', error);
      }
    },
    fetchLatestTweets(){
      // Implementa una llamada a la API de Twitter o usa datos de ejemplo
      // Aquí usaremos datos de ejemplo
      this.latestTweets = [
        { id: '1234567890', user: 'superalgos', text: "Check out our latest update! #Superalgos" },
        { id: '0987654321', user: 'superalgos', text: "Join our community on Telegram! #Crypto #Trading" },
        // ... más tweets
      ];
    },
    loadFavorites(){
      const favs = localStorage.getItem('favoriteDashboards');
      if(favs){
        this.favoriteDashboards = JSON.parse(favs);
      }
    },
    addFavorite(dashboardName){
      if(!this.favoriteDashboards.includes(dashboardName)){
        this.favoriteDashboards.push(dashboardName);
        localStorage.setItem('favoriteDashboards', JSON.stringify(this.favoriteDashboards));
      }
    },
    removeFavorite(dashboardName){
      this.favoriteDashboards = this.favoriteDashboards.filter(fav => fav !== dashboardName);
      localStorage.setItem('favoriteDashboards', JSON.stringify(this.favoriteDashboards));
    }
  },
  mounted(){
    this.fetchLatestMediumPosts();
    this.fetchLatestTweets();
    this.loadFavorites();

    // Escuchar cambios de cuenta
    if (window.ethereum) {
      window.ethereum.on('accountsChanged', (accounts) => {
        if (accounts.length > 0) {
          this.userWalletAddress = accounts[0];
          console.log('Account changed to:', this.userWalletAddress);
          if (typeof this.getAllUserProfiles === 'function') {
            this.getAllUserProfiles();
          }
        } else {
          this.userWalletAddress = '';
          console.warn('No accounts found.');
        }
      });

      // Escuchar cambios de red
      window.ethereum.on('chainChanged', (chainId) => {
        console.log('Chain changed to:', chainId);
        // Opcional: recargar la página
        window.location.reload();
      });
    }
  }
};
</script>

<style scoped>
.dashboard-window {
  background-color: #ffffff;
  color: #000000;
  min-height: 100vh;
  padding: 20px;
}

.image {
  margin-top: 10px;
  width: 100px;
  height: auto;
}

.action-buttons {
  margin-top: 20px;
}

.btn {
  background-color: #c72929;
  color: #ffffff;
  padding: 12px 24px;
  margin: 5px;
  border: 2px solid #c72929;
  transition: all 0.3s ease;
}

.btn:hover {
  background-color: #c72929;
  border: 2px solid #d3d2d2;
}

.btnToken {
  padding: 0; /* Elimina el padding predeterminado */
  border: none;
  background-color: transparent;
  cursor: pointer;
}

.icon-button100 {
  width: 100px; /* Ajusta el tamaño según tus necesidades */
  height: auto;
  display: block;
  margin: auto;
}

.icon-button200 {
  width: 200px; /* Ajusta el tamaño según tus necesidades */
  height: auto;
  display: block;
  margin: auto;
}

.icon-button50 {
  width: 50px; /* Ajusta el tamaño según tus necesidades */
  height: auto;
  display: block;
  margin: auto;
}

.icon-button150 {
  width: 150px; /* Ajusta el tamaño según tus necesidades */
  height: auto;
  display: block;
  margin: auto;
}

.icon-button300 {
  width: 300px; /* Ajusta el tamaño según tus necesidades */
  height: auto;
  display: block;
  margin: auto;
}

.wallet-info {
  margin-top: 20px;
  padding: 10px;
  background-color: #e9ecef;
  border-radius: 5px;
}

.widgets-container {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-around;
  margin-top: 40px;
}

.widget {
  background-color: #f9f9f9;
  border: 1px solid #ddd;
  border-radius: 8px;
  padding: 20px;
  margin: 10px;
  width: 30%;
  box-shadow: 2px 2px 12px rgba(0,0,0,0.1);
}

.widget h3 {
  margin-bottom: 15px;
}

.widget ul {
  list-style-type: none;
  padding: 0;
}

.widget li {
  margin-bottom: 10px;
}

.favorites-section {
  margin-top: 40px;
}

.favorite-buttons {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
}

.favorite-buttons .btn {
  background-color: #007bff;
  border: none;
}

.favorite-buttons .btn:hover {
  background-color: #0056b3;
}

@media (max-width: 768px) {
  .dashboard-window {
    padding: 10px;
  }
  
  .widgets-container {
    flex-direction: column;
    align-items: center;
  }

  .widget {
    width: 90%;
  }
}
</style>
