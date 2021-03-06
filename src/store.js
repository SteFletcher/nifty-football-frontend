import Vue from 'vue';
import Vuex from 'vuex';
import {ethers} from 'ethers';
import Web3 from 'web3'
// import createLogger from 'vuex/dist/logger';

import CardsApiService from './services/api/cardsApi.service';
import {lookupEtherscanAddress} from './utils';

import BlindPackContractService from './services/contracts/blindPackContract.service';
import NotificationService from './services/notification.service';

import ThreeBoxService from './services/api/threeBox.service';
import BlindPackPriceService from "./services/contracts/blindPackPrice.service";

import {initializeAssist} from './services/assist.service';

import {contracts} from 'nifty-football-contract-tools';
import {dotDotDotAccount} from './utils';

Vue.use(Vuex);

/* global web3 */

export default new Vuex.Store({
    // plugins: debug ? [createLogger()] : [],
    state: {
        networkId: 1,
        networkName: null,
        etherscanUrl: 'https://etherscan.io',
        web3Enabled: false,

        ethAccount: null,
        ethAccountDotDotDot: null,
        flags: null,
        squad: null,
        cards: null,
        web3Provider: null,

        // API Services
        cardsApiService: new CardsApiService(),
        threeBoxService: new ThreeBoxService(),
        notificationService: new NotificationService(),

        // Contract Service
        blindPackService: null,
        blindPackPriceService: new BlindPackPriceService(),
        footballCardsContractService: null,
    },
    mutations: {
        ethAccount(state, ethAccount) {
            console.log("Setting ethAccount", ethAccount);

            state.ethAccount = ethers.utils.getAddress(ethAccount);
            state.ethAccountDotDotDot = dotDotDotAccount(state.ethAccount);
            state.threeBoxService.setAccount(state.ethAccount);
        },
        squad(state, squad) {
            state.squad = squad;
        },
        cards(state, cards) {
            state.cards = cards;
        },
        flags(state, flags) {
            state.flags = flags;
        },
        etherscanUrl(state, etherscanUrl) {
            state.etherscanUrl = etherscanUrl;
        },
        provider(state, provider) {
            console.log(`Setting provider for network [${state.networkId}]`, provider);
            state.provider = provider;
            state.providerSigner = provider.getSigner();

            // This needs to not be a etherjs provider...?
            state.threeBoxService.setProvider(window.ethereum);
        },
        web3(state, web3) {
            console.log(`Setting web3 for network [${state.networkId}]`, web3);
            state.web3 = web3;
            state.blindPackService = new BlindPackContractService(state.networkId, web3, state.ethAccount);

            state.web3Enabled = true;
        },
        networkId(state, networkId) {
            state.networkId = networkId;
            // Override the default network of mainnet if we are switching
            console.log(`Setting network ID [${state.networkId}] on services`);
            state.cardsApiService.setNetworkId(networkId);
            state.notificationService.setNetworkId(networkId);
            state.blindPackPriceService.setNetworkId(networkId);

            state.networkName = contracts.getNetwork(networkId);
        },
    },
    actions: {
        async bootstrapApp({commit, dispatch}) {
            dispatch('loadFlags');
            commit('etherscanUrl', lookupEtherscanAddress(1));
        },
        async lazyLoadWeb3({commit, dispatch, state}) {
            /* global ethereum */
            // enable ethereum
            if (!state.ethAccount && window.ethereum) {
                console.log('Enabled Web3');
                ethereum.enable()
                    .catch((reason) => {
                        console.error('Error - ethereum.enabled() rejected', reason);

                        if (reason === 'User rejected provider access') {
                            // The user didn't want to sign in!
                        } else {
                            // This shouldn't happen, so you might want to log this...
                            console.log('There was an issue signing you in.');
                        }
                    })
                    // In the case they approve the log-in request, you'll receive their accounts:
                    .then((accounts) => {
                        console.info('ethereum.enabled() accepted', accounts);

                        const account = accounts[0];
                        commit('ethAccount', account);
                        dispatch('bootstrapWeb3');

                        // Reload the account logic if we see a change
                        ethereum.on('accountsChanged', (accounts) => {
                            console.log('accountsChanged', accounts);

                            const account = accounts[0];
                            commit('ethAccount', account);
                            dispatch('bootstrapWeb3');
                        });
                    });
            }
            // Legacy dapp browsers...
            else if (!state.ethAccount && window.web3) {
                console.log('Legacy');
                window.web3 = new Web3(web3.currentProvider);

                console.log(`Account`, window.web3.eth.accounts[0]);
                commit('ethAccount', window.web3.eth.accounts[0]);
                dispatch('bootstrapWeb3');
            }
            // Non-dapp browsers...
            else {
                console.log('Non-Ethereum browser detected. You should consider trying MetaMask!');
            }
        },
        async bootstrapWeb3({commit, dispatch}) {
            try {
                console.log("Bootstrapping application", window.ethereum);
                const ethersProvider = new ethers.providers.Web3Provider(window.ethereum);
                const {chainId, name} = await ethersProvider.getNetwork();
                const web3 = new Web3(window.ethereum);

                // initialize assist library with instantiated web3 and networkId
                initializeAssist(web3, {networkId: chainId});

                console.log(`Working on network [${chainId}] [${name}]`);

                commit('networkId', chainId);
                commit('etherscanUrl', lookupEtherscanAddress(chainId));
                commit('provider', ethersProvider);
                commit('web3', web3);

                dispatch('loadSquad');
            } catch (e) {
                console.error(`Something went big bang`, e);
            }
        },
        async loadSquad({commit, state}) {
            console.log("Loading squad for account", state.ethAccount);
            if (state.ethAccount) {
                const squad = await state.cardsApiService.loadTokensForAccount(state.ethAccount);
                commit('squad', squad);

                // FIXME move to API
                if (squad) {

                    const promises = squad.map((id) => state.cardsApiService.loadTokenForTokenId(id));

                    const cards = await Promise.all(promises);

                    const cardsMap = cards.reduce((map, obj) => {
                        map[obj.tokenId] = obj;
                        return map;
                    }, {});

                    commit('cards', cardsMap);
                }
            }
        },
        async loadFlags({commit, state}) {
            console.log("Loading flags");
            const data = await state.cardsApiService.loadFlags();
            commit('flags', data.flags);
        },
    }
});
