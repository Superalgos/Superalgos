<!-- src/views/Governance.vue -->
<template>
  <div class="dashboard-window container-fluid">
    <!-- Header Section -->
    <div class="row col-12">
      <div class="col-3">
        <img class="image" :src="dashboardIcon" alt="Dashboard Icon">
      </div>
      <div class="col-6 mt-4 text-center">
        <h2><strong>Superalgos Governance Dashboard</strong></h2>
        <h5>(Under Construction ...)</h5>
      </div>
    </div>

    <!-- Action Buttons -->
    <div class="row col-12 justify-content-end">
      <div class="col-auto">
        <button class="btnToken btn-primary mb-2" @click="createUserProfile">
          <img :src="newprofileIcon" alt="New Profile" class="icon-button100" />
        </button>
        <button class="btnToken btn-primary mb-2" @click="connectWallet" :disabled="loadingWallet">
          <img :src="metamaskIcon" alt="MetaMask" class="icon-button100" />
        </button>
        <span v-if="loadingWallet">Connecting...</span>
      </div>
    </div>
    
    <!-- Mostrar Dirección de Wallet Conectada -->
    <div class="wallet-info" v-if="userWalletAddress">
      <p><strong>Connected Wallet:</strong> {{ userWalletAddress }}</p>
    </div>
    
    <!-- Tabs -->
    <div class="row col-12">
      <Tabs :tabList="tabList">
        <!-- Users Tab -->
        <template v-slot:tabPanel-1>
          <div>
            <table class="table table-striped">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Blockchain Power</th>
                  <th>Incoming Power</th>
                  <th>Token Power</th>
                  <th>Awarded Tokens</th>
                  <th>Bonus Tokens</th>
                  <th>Tokens Mined</th>
                  <th>Balance</th>
                  <th>Balance BNB</th>
                  <th>Balance ETH</th>
                  <th>Balance ZKS</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="profile in allUserProfiles" :key="profile.profileId">
                  <td>{{ profile.name }}</td>
                  <td>{{ profile.blockchainPower }}</td>
                  <td>{{ profile.incomingPower }}</td>
                  <td>{{ profile.tokenPower }}</td>
                  <td>{{ profile.awarded }}</td>
                  <td>{{ profile.bonus }}</td>
                  <td>{{ profile.tokensMined }}</td>
                  <td>{{ profile.balance }}</td>
                  <td>{{ profile.balanceBNB }}</td>
                  <td>{{ profile.balanceETH }}</td>
                  <td>{{ profile.balanceZKS }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </template>

        <!-- Programs Token Power Tab 
         Añádir todo en panel 1 con un action button de ... con desplegable (Details) 
         entocnes puedes ver la distribucion de token power entre todos los programas disponibles,
         con el porcentaje para ver cuanto hay en cada uno -->
        <template v-slot:tabPanel-2>
          <div>
            <div v-for="profile in allUserProfiles" :key="profile.profileId" class="programs-token-power">
              <h4>{{ profile.name }}</h4>
              <Table class="table table-bordered">
                <thead>
                  <tr>
                    <th>Program Name</th>
                    <th>Token Power</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="program in profile.programsTokenPower" :key="program.programName">
                    <td>{{ program.programName }}</td>
                    <td>{{ program.tokenPower }}</td>
                  </tr>
                </tbody>
              </Table>
            </div>
          </div>
        </template>
        <!-- Programs Token Power Tab -->

        <template v-slot:tabPanel-3>
          <div>
            <h3>Programs Token Power</h3>
            <div v-for="profile in allUserProfiles" :key="profile.profileId" class="programs-token-power">
              <h4>{{ profile.name }}</h4>
              <Table class="table table-bordered">
                <thead>
                  <tr>
                    <th>Program Name</th>
                    <th>Token Power</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="program in profile.programsTokenPower" :key="program.programName">
                    <td>{{ program.programName }}</td>
                    <td>{{ program.tokenPower }}</td>
                  </tr>
                </tbody>
              </Table>
            </div>
          </div>
        </template>

        <!-- Puedes añadir más pestañas aquí para Staking, Liquidity, Referrals, etc. -->
      </Tabs>
    </div>
    
    <!-- Footer -->
    <div class="row col-12">
      <div class="col-6" v-if="getTimestamp !== ''">Last update: {{ getTimestamp }}</div>
      <div class="col-6" v-if="host !== ''">Running on: {{ host }}</div>
    </div>
  </div>
</template>

<!-- src/views/Governance.vue -->
<script>
import { ethers } from 'ethers'; // Importa ethers.js
import dashboardIcon from "../assets/dashboard.png";
import pancakeSwapIcon from "../assets/pancakeswap-01.svg";
import oneInchIcon from "../assets/1inch.svg";
import metamaskIcon from "../assets/metaMask_Fox.svg";
import newprofileIcon from "../assets/profile-constructor.svg";
import Tabs from "../components/Tabs.vue";
import Table from '../components/Table.vue';
import "bootstrap/dist/css/bootstrap.min.css";

export default {
  // Receive incoming data from parent app 
  props: ["incomingData", "timestamp"],
  components: { Tabs, Table },
  data () {
    return {
      tabList: ["Users", "Programs Token Power"], // Añadida una segunda pestaña
      dataKey: 'Platform-GovernanceData',
      dashboardIcon: dashboardIcon,
      pancakeSwapIcon,
      oneInchIcon,
      metamaskIcon,
      newprofileIcon,
      loadingProfile: false,
      loadingWallet: false,
      allUserProfiles: [],
      host: location.host.split(':')[0],
      userWalletAddress: '' // Añadido para almacenar la dirección de la wallet
    }
  },
  computed: {
    getTimestamp () {
      return this.timestamp
    },
    userProfile() {
      // Filtrar el perfil que coincide con la dirección de la wallet conectada
      return this.allUserProfiles.find(profile => profile.wallet.toLowerCase() === this.userWalletAddress.toLowerCase());
    }
  },
  watch: {
    incomingData: {
      handler(newData) {
        console.log('Incoming Data:', newData); // Para depuración
        // Solo llamar a getAllUserProfiles si incomingData contiene la clave
        if (this.incomingData && this.incomingData[this.dataKey]) {
          this.getAllUserProfiles();
        }
      },
      deep: true,
      immediate: true,
    },
    userWalletAddress(newAddress) {
      if (newAddress && this.incomingData && this.incomingData[this.dataKey]) {
        this.getAllUserProfiles();
      }
    },
  },
  methods: {
    /* 
    Función para obtener todos los perfiles de usuarios
    */
    getAllUserProfiles() {
      const key = this.dataKey; // 'Platform-GovernanceData'
      if (
        key in this.incomingData &&
        Array.isArray(this.incomingData[key]) &&
        this.incomingData[key].length > 0
      ) {
        const governanceData = this.incomingData[key][0].governanceData; // Obtener la propiedad governanceData
        console.log('governanceData:', governanceData); // Para depuración
        
        if (Array.isArray(governanceData)) {
          this.allUserProfiles = governanceData.map(profile => ({
            profileId: profile.profileId || 'N/A',
            name: profile.name || 'N/A',
            blockchainPower: profile.blockchainPower || 0,
            incomingPower: profile.incomingPower || 0,
            tokenPower: profile.tokenPower || 0,
            awarded: profile.awarded || 0,
            bonus: profile.bonus || 0,
            tokensMined: profile.tokensMined || 0,
            balance: profile.balance || 0,
            balanceBNB: profile.balancesByChain?.balanceBNB || 0,
            balanceETH: profile.balancesByChain?.balanceETH || 0,
            balanceZKS: profile.balancesByChain?.balanceZKS || 0,
            wallet: profile.wallet || '', // Asegurarse de tener la propiedad 'wallet'
            programsTokenPower: profile.programsTokenPower || [] // Añadido
          }));
          console.log('All User Profiles:', this.allUserProfiles); // Para depuración
        } else if (typeof governanceData === 'object' && governanceData !== null) {
          this.allUserProfiles = Object.values(governanceData).map(profile => ({
            profileId: profile.profileId || 'N/A',
            name: profile.name || 'N/A',
            blockchainPower: profile.blockchainPower || 0,
            incomingPower: profile.incomingPower || 0,
            tokenPower: profile.tokenPower || 0,
            awarded: profile.awarded || 0,
            bonus: profile.bonus || 0,
            tokensMined: profile.tokensMined || 0,
            balance: profile.balance || 0,
            balanceBNB: profile.balancesByChain?.balanceBNB || 0,
            balanceETH: profile.balancesByChain?.balanceETH || 0,
            balanceZKS: profile.balancesByChain?.balanceZKS || 0,
            wallet: profile.wallet || '', // Asegurarse de tener la propiedad 'wallet'
            programsTokenPower: profile.programsTokenPower || [] // Añadido
          }));
          console.log('All User Profiles:', this.allUserProfiles); // Para depuración
        } else {
          console.warn('governanceData is neither an array nor an object.');
          this.allUserProfiles = [];
        }
      } else {
        console.warn('No governance data available in incomingData.');
        this.allUserProfiles = [];
      }
    },    

    /* 
    Función para conectar una wallet Web3
    */
    async connectWallet() {
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
          console.log('Connected wallet:', address);

          // Guardar la dirección en localStorage
          localStorage.setItem('userWalletAddress', address);

          // Llamar a getAllUserProfiles después de conectar la wallet
          this.getAllUserProfiles();
        } else {
          console.error('Non-Ethereum browser detected. Please install MetaMask.');
          alert('Non-Ethereum browser detected. Please install MetaMask.');
        }
      } catch (error) {
        console.error('Error connecting wallet:', error);
        alert('Error connecting wallet. Please try again.');
      } finally {
        this.loadingWallet = false;
      }
    },
    
    /* 
    Función para crear un nuevo perfil de usuario 
    */
    async createUserProfile() {
      this.loadingProfile = true;
      // Implementa tu lógica aquí y establece loadingProfile a false cuando termines
      // Por ejemplo, podrías emitir un evento o llamar a una API para crear el perfil
      // Aquí solo simulamos una espera
      setTimeout(() => {
        console.log('User profile created.');
        this.loadingProfile = false;
        alert('User profile created successfully.');
      }, 2000);
    },
    
    /* 
    URLs para comprar Tokens en PancakeSwap, 1Inch y URL para la página principal de Superalgos
    */
    buyToken1 () {
      window.open('https://pancakeswap.finance/info/token/0xfb981ed9a92377ca4d75d924b9ca06df163924fd', '_blank') 
    },
    buyToken2 () {
      window.open('https://app.1inch.io/#/1/simple/swap/USDT/SA', '_blank') 
    },
    mainPage () {
      window.open('https://superalgos.org/index.shtml', '_blank')
    }
  },
  mounted(){
    // Cargar la dirección de la wallet desde localStorage si existe
    const storedAddress = localStorage.getItem('userWalletAddress');
    if (storedAddress) {
      this.userWalletAddress = storedAddress;
      this.getAllUserProfiles();
    }

    // Escuchar cambios de cuenta
    if (window.ethereum) {
      window.ethereum.on('accountsChanged', (accounts) => {
        if (accounts.length > 0) {
          this.userWalletAddress = accounts[0];
          console.log('Account changed to:', this.userWalletAddress);
          // Guardar la nueva dirección en localStorage
          localStorage.setItem('userWalletAddress', this.userWalletAddress);
          this.getAllUserProfiles();
        } else {
          this.userWalletAddress = '';
          console.warn('No accounts found.');
          // Eliminar la dirección de localStorage
          localStorage.removeItem('userWalletAddress');
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
}
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

.table {
  width: 100%;
  margin-top: 20px;
}

.table th, .table td {
  text-align: center;
  vertical-align: middle;
}

.programs-token-power {
  margin-bottom: 30px;
}

@media (max-width: 768px) {
  .dashboard-window {
    padding: 10px;
  }

  .table th, .table td {
    font-size: 0.9em;
    padding: 8px;
  }

  .programs-token-power h4 {
    font-size: 1.2em;
  }

  .programs-token-power table {
    font-size: 0.9em;
  }
}
</style>
