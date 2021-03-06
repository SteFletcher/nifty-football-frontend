const INFURA_KEY = "6e7a3de11d3745fe8763bab4466ec8de";

const ASSIST_KEY = "8bf348fd-d9df-4b54-b8b1-1ad14d15e4c3"

const API_CONFIG = {
    local: "http://localhost:5000/futbol-cards/us-central1/main/api",
    live: "https://niftyfootball.cards/api"
};

const getApi = () => {
    switch (window.location.hostname) {
        case "localhost":
        case "127.0.0.1":
            return API_CONFIG.local;
        default:
            return API_CONFIG.live;
    }
};

const AXIOS_CONFIG = {headers: {'Access-Control-Allow-Origin': '*'}};

const lookupEtherscanAddress = (id) => {
    switch (id) {
        case 1:
            return 'https://etherscan.io';
        case 3:
            return 'https://ropsten.etherscan.io';
        case 4:
            return 'https://rinkeby.etherscan.io';
        case 42:
            return 'https://kovan.etherscan.io';
        default:
            return 'https://etherscan.io';
    }
};

const dotDotDotAccount = (ethAccount) => {
    if (ethAccount && ethAccount.startsWith(`0x`)) {
        return ethAccount.substr(0, 6) + '...' + ethAccount.substr(ethAccount.length - 6, ethAccount.length);
    }
    return ethAccount;
};

export {
    getApi,
    lookupEtherscanAddress,
    dotDotDotAccount,
    AXIOS_CONFIG,
    INFURA_KEY,
    ASSIST_KEY
};
