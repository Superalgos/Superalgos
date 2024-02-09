import { Web3Modal } from "@web3modal/standalone"
import { SignClient } from "@walletconnect/sign-client"
import * as ethjs from "@ethereumjs/util"
import store from '../store/index'

async function walletClient (githubUsername) {
    // Define constants
    const projectId = '7874a1adf3b0f190f23afc9b91c746a3'
    const namespaces = {
        eip155: { 
            methods: ['eth_sign'], 
            chains: ['eip155:1'], 
            events: ['chainChanged', 'accountsChanged', 'connect', 'disconnect'], 
        }
    }
    // Prepare all to present modal
    const web3Modal = new Web3Modal({
        projectId,
        standaloneChains: namespaces.eip155.chains
    })

    let provider = await SignClient.init({    
        projectId,
    })

    let signature = undefined

    try {
        if (provider) {
            const { uri, approval } = await provider.connect({
                requiredNamespaces: namespaces,
            })
        
            if (uri) {
                web3Modal.openModal({ uri });
                store.commit("SHOW_CREATE_PROFILE", false);
                const session = await approval()
                signature = await signAccount(session, provider, githubUsername)
                web3Modal.closeModal()
                
                if (signature) {
                    provider.disconnect(session)
                    return signature
                }
            }
        }
    } catch (err) {
        console.error(err)
    }
};

async function signAccount (session, provider, githubUsername) {

    try {

        const msgBuffer = ethjs.toBuffer(ethjs.fromUtf8(githubUsername))
        const msgHash = ethjs.hashPersonalMessage(msgBuffer) // it adds the prefix

        let signedMessage = await provider.request({
            topic: session.topic,
            chainId: "eip155:1",
            request: {
              id: 1,
              jsonrpc: "2.0",
              method: "eth_sign",
              params: [
                session.namespaces.eip155.accounts[0].slice(9),
                ethjs.bufferToHex(msgHash)]
            },
        });

        if (signedMessage) {
            const signatureBuffer = ethjs.toBuffer(signedMessage)
            const signatureParams = ethjs.fromRpcSig(signatureBuffer)
            const publicKey = ethjs.ecrecover(
                msgHash,
                signatureParams.v,
                signatureParams.r,
                signatureParams.s
            )
            const addressBuffer = ethjs.publicToAddress(publicKey)
            const address = ethjs.bufferToHex(addressBuffer)
            if (address.toLowerCase() === session.namespaces.eip155.accounts[0].slice(9).toLowerCase()) {
                let signature = {
                        message: githubUsername,
                        messageHash: ethjs.bufferToHex(msgHash),
                        v: ethjs.bufferToHex(signatureParams.v),
                        r: ethjs.bufferToHex(signatureParams.r),
                        s: ethjs.bufferToHex(signatureParams.s),
                        signature: ethjs.bufferToHex(signatureBuffer),
                }
                return JSON.stringify(signature)
            }
        }
    } catch (e) {
        console.log(e)
        console.log(
            "Could not create user. Confirm wallet is correctly configured."
        )
    }
}

export {
    walletClient
};
