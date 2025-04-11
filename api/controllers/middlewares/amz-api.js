const { delay } = require('../utils/misc-utils');

const generateLWAaccessToken = async () => {

    const url = "https://api.amazon.com/auth/o2/token";
    const payload = {
        grant_type: "refresh_token",
        refresh_token: process.env.REFRESH_TOKEN,
        client_id: process.env.CLIENT_ID,
        client_secret: process.env.CLIENT_SECRENT
    };

    const options = {
        method: "POST",
        body: JSON.stringify(payload),
        headers: { 'Content-Type': 'application/json' },
        muteHttpExceptions: true
    };

    try {
        let response = await fetch(url, options);
        let data = await response.json();
        return data.access_token;
    } catch (error) {
        console.error('Error fetching data:', error);
        throw new Error('Failed to fetch data');
    }
};

const generateClientLWAaccessToken = async (account) => {
    let refreshToken;
    switch (account) {
        case 'evenflo':
            refreshToken = process.env.REFRESH_TOKEN_Evenflo
            break
        case 'wonderfold':
            refreshToken = process.env.REFRESH_TOKEN_Wonderfold
            break
        case 'fieldsheer':
            refreshToken = process.env.REFRESH_TOKEN_Fieldsheer
            break
        case 'booyah':
            refreshToken = process.env.REFRESH_TOKEN_Booyah
            break
        case 'sebago':
            refreshToken = process.env.REFRESH_TOKEN_Sebago
            break
        case 'safetyjogger':
            refreshToken = process.env.REFRESH_TOKEN_Safetyjogger
            break
        case 'armsreach':
            refreshToken = process.env.REFRESH_TOKEN_Armsreach
            break
        case 'fila':
            refreshToken = process.env.REFRESH_TOKEN_fila
            break
        case 'magformers':
            refreshToken = process.env.REFRESH_TOKEN_magformers
            break
        case 'Hootenannygames':
            refreshToken = process.env.REFRESH_TOKEN_Hootenannygames
            break
        case 'plantoys':
            refreshToken = process.env.REFRESH_TOKEN_Plantoys
            break
        case 'wohali':
            refreshToken = process.env.REFRESH_TOKEN_Wohali
            break
        case 'safetyshirtz':
            refreshToken = process.env.REFRESH_TOKEN_SafetyShirtz
            break
        case 'tru-spec':
            refreshToken = process.env.REFRESH_TOKEN_Truspec
            break
        case 'revolutionrace':
            refreshToken = process.env.REFRESH_TOKEN_Revolutionrace
            break
        default:
            refreshToken = ''
            break
    }
    const url = "https://api.amazon.com/auth/o2/token";
    const payload = {
        grant_type: "refresh_token",
        refresh_token: refreshToken,
        client_id: process.env.CPI_LWA_access_key,
        client_secret: process.env.CPI_LWA_secret
    };
    const options = {
        method: "POST",
        body: JSON.stringify(payload),
        headers: { 'Content-Type': 'application/json' },
        muteHttpExceptions: true
    };

    try {
        let response = await fetch(url, options);
        let data = await response.json();
        return data.access_token;
    } catch (error) {
        console.error('Error fetching data:', error);
        throw new Error('Failed to fetch data');
    }
};



const amzBaseUrl = "https://sellingpartnerapi-na.amazon.com";

const getMarketPlaceIDs = (marketplaces) => {
    switch (marketplaces) {
        case "US":
            return 'ATVPDKIKX0DER';
        case "CA":
            return 'A2EUQ1WTGCTBG2';
        case "BR":
            return 'A2Q3Y263D00KWC';
        case "MX":
            return 'A1AM78C64UM0Y8';
        default:
            return 'UNKNOWN';
    }
};

const getCookieByAccount = async (account, maxRetries = 3) => {
    return new Promise(async (resolve, reject) => {
        const baseUrl = `https://script.google.com/macros/s/AKfycbwo_7MvXzMuNEb-e9qUI65CuSE9tA-rwDCprSAsKQn7SIZQmnb4HHorE8FpPa4_UgYszQ/exec?account=${account}`;
        const options = {
            method: 'get',
            headers: { 'Content-Type': 'application/json' }
        };
        const fetchData = async (retryCount) => {
            try {
                const response = await fetch(baseUrl, options);
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                const data = await response.json();
                resolve(data);
            } catch (error) {
                if (retryCount > 0) {
                    fetchData(retryCount - 1);
                } else {
                    reject(error);
                }
            }
        };

        fetchData(maxRetries);
    });
}

const getCookieForB2b = async (b2b, maxRetries = 3) => {
    return new Promise(async (resolve, reject) => {
        const baseUrl = `http://sphere.outdoorequippedservice.com/api/v1/cookie/provide/${b2b}`;
        const options = {
            method: 'get',
            headers: { 'Content-Type': 'application/json', 'Authorization': '5235CVSEDZS123' }
        };
        const fetchData = async (retryCount) => {
            try {
                const response = await fetch(baseUrl, options);
                if (!response.ok) {
                    throw new Error(`Cookie Provider error status: ${response.status}`);
                }
                const data = await response.json();
                if (data.data.cookie) {
                    resolve({ cookie: data.data.cookie[0] });
                }
                else {
                    throw new Error(`Cookie Provider error: No cookie obtained`);
                }

            } catch (error) {
                if (retryCount > 0) {
                    fetchData(retryCount - 1);
                } else {
                    reject(error);
                }
            }
        };

        fetchData(maxRetries);
    });
}

const getCookieProviderInit = async (account, marketplace, maxRetries = 3) => {
    return new Promise(async (resolve, reject) => {
        const baseUrl = `https://cookies.outdoorequippedservice.com/getHeaderCookies/amazon/${account.toLowerCase()}?marketplace=${marketplace.toLowerCase()}`;
        const options = {
            method: 'get',
            headers: { 'Content-Type': 'application/json' }
        };
        const fetchData = async (retryCount) => {
            try {
                const response = await fetch(baseUrl, options);
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                const data = await response.json();
                resolve(data);
            } catch (error) {
                if (retryCount > 0) {
                    fetchData(retryCount - 1);
                } else {
                    reject(error);
                }
            }
        };

        fetchData(maxRetries);
    });
}

const getSkuByAsin = async (amazonApiToken, asins, marketPlace, maxRetries = 3, delayMs = 1300) => {
    return new Promise(async (resolve, reject) => {
        const identifiers = asins.join(',');
        const baseUrl = `${amzBaseUrl}/products/pricing/v0/price`;
        const queryStringArr = [
            `MarketplaceId=${getMarketPlaceIDs(marketPlace)}`,
            `Asins=${identifiers}`,
            `ItemType=Asin`,

        ];
        const queryString = queryStringArr.join('&');
        const url = `${baseUrl}?${queryString}`;
        const options = {
            method: 'get',
            headers: { 'x-amz-access-token': amazonApiToken }
        };
        const fetchData = async (retryCount) => {
            try {
                const response = await fetch(url, options);
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                const data = await response.json();
                resolve([data]);
                await delay(delayMs);
            } catch (error) {
                if (retryCount > 0) {
                    await delay(delayMs);
                    fetchData(retryCount - 1);
                } else {
                    reject(error);
                }
            }
        };

        fetchData(maxRetries);
    });
}

const getSellerCentralCookie = async (marketPlace, maxRetries = 3) => {
    return new Promise(async (resolve, reject) => {

        const baseUrl = marketPlace === "US" ? `https://script.google.com/macros/s/AKfycbzcKcVEK3rPFsH8_BsGrRkoWIYeathOxjp_rbl-wM2M6KEZ352VFeEOqNe6EAnRzBJldA/exec` : `https://script.google.com/macros/s/AKfycbwLQwTNLRPBet-XNUAQVRFo1K8AnT_JTif8a8wCDCanlydDol9DHA4IDzry97rSghZC9w/exec`

        const options = {
            method: 'get',
            headers: { 'Content-Type': 'application/json' }
        };
        const fetchData = async (retryCount) => {
            try {
                const response = await fetch(baseUrl, options);
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                const data = await response.json();
                resolve(data);
            } catch (error) {
                if (retryCount > 0) {
                    fetchData(retryCount - 1);
                } else {
                    reject(error);
                }
            }
        };

        fetchData(maxRetries);
    });
}



module.exports = { generateLWAaccessToken, getMarketPlaceIDs, amzBaseUrl, getSellerCentralCookie, generateClientLWAaccessToken, getCookieByAccount, getSkuByAsin, getCookieProviderInit, getCookieForB2b }