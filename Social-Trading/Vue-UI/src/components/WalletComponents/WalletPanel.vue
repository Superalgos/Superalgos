<template>
    <div class="modal-wallet-overlay" v-if="getWalletVisibility">
        <div id="wallet-main-div" class="wallet" >
            <div class="top-bar">
                <p  class="bold">Wallet</p>
                <input class="close-btn" type="button" value="X" v-on:click="closeWallet">
            </div>
        
        </div>
    </div>
</template>

<script>

import store from '../../store/index'


export default {
    name: 'wallet-panel',
    data() {
    return {
        };
    },
    methods: {
        closeWallet() {
            store.commit("SHOW_WALLET", false);
            return store.state.showWallet;
        }
    },
    computed: {
        getWalletVisibility() {
            return store.state.showWallet 
        }
}
};
</script>

<style>
.modal-wallet-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: 9999;
    background-color: rgba(0, 0, 0, 0.4);
    display: flex;
    align-items: center;
    justify-content: center;
}
.wallet {
    background-color: rgb(240, 238, 238);
    border: solid 0.5px rgba(0, 0, 0, 0.479);
    border-radius: 20px;
    width: 35vw;
    height: 75vh;
    color: black;
}
/* Header Label */
#wallet-label-top {
    text-align: center;
    border-bottom: solid 1px black;
    font-weight: 600;
    font-size: 1.3vw;
    margin-top: 0px;
}
.bold {
    font-weight: 700;
}



</style>