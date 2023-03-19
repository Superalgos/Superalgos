<template>
    <div class="modal-wallet-overlay" v-if="getWalletVisibility">
        <div id="wallet-main-div" class="wallet" >
            <!-- Panel Header -->
            <div class="top-bar">
                <p  class="bold center-header">Wallet</p>
                <input class="close-btn" type="button" value="X" v-on:click="closeWallet">
            </div>
            <!-- Panel Body -->
            <div class="center">
                <div class="info-card">
                    <h1 class="wallet-account-name">{{getProfileName}}</h1>
                    <div class="balance-list-address center">
                        <p class="address-h1">Wallet Address</p>
                    </div>
                    <div class="balance-list-address center">
                        <p class="address-p">{{getWalletAddress}}</p>
                    </div>
                    <div class="balance-list center">
                        <p class="balance-header">Token Balance</p>
                        <p class="balance-p">{{getBalanceSA}}</p>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import store from '../../store/index';

export default {
    name: 'wallet-panel',
    data() {
    return {
        balanceSA: 0
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
            return store.state.showWallet;
        },
        getProfileName() {
            return store.state.profile.userProfileHandle;
        },
        getWalletAddress() {
            return store.state.profile.blockchainAccountWallet;
        },
        getBalanceSA() {
            return store.state.profile.balanceSA;
        }
    },
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

/* Body */
.info-card {
    display: flex;
    flex-direction: column;
    border: ridge 1px black;
    border-radius: 20px;
    margin: 10% 10%;
    height: 50vh;
    
}
.balance-list-address {
    position: relative;
    display: flex;
    flex-direction: column;
    margin: 0% 10%;
    margin-top: 1%;
    border: solid 1px black;
    border-radius: 35px;
    height: fit-content;
    width: fit-content;
    align-self: center;
    justify-content: center;
    padding: 0% 8%;
    font-size: 20px;
    font-weight: 600;
    background-color: white;
    
}
.balance-list {
    position: relative;
    display: flex;
    flex-direction: column;
    margin: 10% 10%;
    margin-top: 10%;
    border: solid 1px black;
    border-radius: 35px;
    height: fit-content;
    width: fit-content;
    align-self: center;
    justify-content: center;
    padding: 2% 8%;
    font-size: 20px;
    font-weight: 600;
    background-color: white;
}
.wallet-account-name {
    margin-top: 5%;
    margin-bottom: 0px;
}
.address-h1 {
    margin: 8px;
}
.balance-header {
    font-size: 25px;
    margin: 8px;
    margin-bottom: 0px;
}
.balance-p {
    font-size: 20px;
}
.address-p {
    margin: 0px;
    font-size: 18px;
    font-weight: 400;
}
</style>