
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



module.exports = {generateLWAaccessToken, getMarketPlaceIDs,amzBaseUrl}