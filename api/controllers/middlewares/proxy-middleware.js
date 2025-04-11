const { resolve } = require('path');
const countryList = require('./country-codes');

const getRandomUsServer = (country = false, usServer = false) => {
    const array = [
        'us1', 'us2', 'us3', 'us4', 'us5', 'us6', 'us7', 'us8', 'us9', 'us10',
        'us11', 'us12', 'us13', 'us14', 'us15', 'us16', 'us17', 'us18', 'us19', 'us20',
        'eu1', 'eu2', 'eu3', 'eu4', 'eu5', 'eu6', 'eu7', 'eu8', 'eu9', 'eu10',
        'eu11', 'eu12'
    ];

    const usServers = [
        'us1', 'us2', 'us3', 'us4', 'us5', 'us6', 'us7', 'us8', 'us9', 'us10',
        'us11', 'us12', 'us13', 'us14', 'us15', 'us16', 'us17', 'us18', 'us19', 'us20'
    ];

    if (country && usServer) {
        return "US";
    }

    if (usServer) {
        const randomIndex = Math.floor(Math.random() * usServers.length);
        return usServers[randomIndex];
    }

    const randomIndex = Math.floor(Math.random() * array.length);
    return array[randomIndex];
};


const randomDelay = (minMs, maxMs) => {
    const delayTime = Math.floor(Math.random() * (maxMs - minMs + 1)) + minMs;
    return new Promise(resolve => setTimeout(resolve, delayTime));
};

const postToProxySite = async (server, url, maxRetries = 3) => {

    const baseUrl = `https://${server}.proxysite.com/includes/process.php?action=update`;

    const formData = new URLSearchParams();
    formData.append('server-option', server);
    formData.append('allowCookies', 'on');
    formData.append('d', url);

    const options = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: formData.toString(),
        redirect: 'manual'
    };

    const fetchData = async (retryCount) => {
        try {
            await randomDelay(500, 3000);
            const response = await fetch(baseUrl, options);
            if (response.status >= 300 && response.status < 400) {
                const locationHeader = response.headers.get('location');
                const setCookieHeader = response.headers.get('set-cookie');
                return {
                    setCookie: setCookieHeader,
                    location: locationHeader
                };
            } else if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
        } catch (error) {
            if (retryCount > 0) {
                return await fetchData(retryCount - 1);
            } else {
                console.error(`postToProxySite ${url} - Failed after ${maxRetries} attempts. Error: ${error.message}`);
                throw new Error(`postToProxySite ${url} - Fetch failed: ${error.message}`);
            }
        }
    };

    return fetchData(maxRetries);
};

const amzExecute = async (url, cookie, maxRetries = 3) => {
    return new Promise(async (resolve, reject) => {

        const options = {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Cookie': cookie,
            },
            redirect: 'manual'
        };

        const fetchData = async (retryCount) => {
            try {
                await randomDelay(500, 2000);
                const response = await fetch(url, options);

                if (!response.ok) {
                    throw new Error(`amzExecute ${url} - HTTP error! status: ${response.status}`);
                }
                const htmlData = await response.text();

                resolve(htmlData);
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

const luminaExec = async (url, area, maxRetries = 3) => {
    return new Promise(async (resolve, reject) => {
        const baseUrl = `https://webproxy.lumiproxy.com/request?area=${area}&u=${url}`
        const options = {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            }
        };

        const fetchData = async (retryCount) => {
            try {
                await randomDelay(500, 2000);
                const response = await fetch(baseUrl, options);

                if (!response.ok) {
                    if (response.status == 404) {
                        const htmlData = await response.text();
                        resolve(htmlData);
                    }
                    else {
                        throw new Error(`luminaExec ${baseUrl} - HTTP error! status: ${response.status}`);
                    }
                }
                else {
                    const htmlData = await response.text();
                    resolve(htmlData);
                }
            } catch (error) {
                if (retryCount > 0) {
                    fetchData(retryCount - 1);
                } else {
                    reject(error);
                }
            }
        };

        await randomDelay(1000, 3000);
        fetchData(maxRetries);
    });
}

const scrapeRandomMethod = async (url, server = false) => {
    try {
        const randomProxyMethod = Math.random() < 0.5;
        let amzExec;

        try {
            if (randomProxyMethod) {
                const usServer = server ? getRandomUsServer(false, true) : getRandomUsServer();
                const headers = await postToProxySite(usServer, url);
                amzExec = await amzExecute(headers.location, headers.setCookie);
            } else {
                const area = server ? getRandomUsServer(countryList(), true) : getRandomUsServer(countryList());
                amzExec = await luminaExec(url, area);
            }
        } catch (error) {

            if (randomProxyMethod) {
                const area = server ? getRandomUsServer(countryList(), true) : getRandomUsServer(countryList());
                amzExec = await luminaExec(url, area);
            } else {
                const usServer = server ? getRandomUsServer(false, true) : getRandomUsServer();
                const headers = await postToProxySite(usServer, url);
                amzExec = await amzExecute(headers.location, headers.setCookie);
            }
        }

        return amzExec;

    } catch (error) {
        console.log('Error:', error.message);
    }
};

const useScraperApiExec = async (url, maxRetries = 3) => {
    return new Promise(async (resolve, reject) => {
        const fetchData = async (retryCount) => {
            try {
                const baseUrl = `http://api.scraperapi.com?api_key=${process.env.SCRAPER_API}&url=${url}`
                const options = {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                    }
                };
                await randomDelay(500, 1000);
                const response = await fetch(baseUrl, options);
                const data = await response.text();
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
    })
}

const useSphereProvider = async (urlArr, resultSchemaArr, cookie=null, instructionId="amazon-review", maxRetries = 3) => {
    return new Promise(async (resolve, reject) => {
        const fetchData = async (retryCount) => {
            try {
                const baseUrl = `http://sphere.outdoorequippedservice.com/api/v1/scrape`
                const options = {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': process.env.SPHERE_API
                    },
                    body: JSON.stringify({
                        "instructionId": instructionId,
                        "cookie": cookie,
                        "urls": urlArr,
                        "resultSchema": resultSchemaArr
                    })
                };
                const response = await fetch(baseUrl, options);
                const data = await response.json();
                resolve(data.data);

            } catch (error) {
                if (retryCount > 0) {
                    fetchData(retryCount - 1);
                } else {
                    reject(error);
                }
            }
        };
        fetchData(maxRetries);
    })
}

const useLuminaProxy = async (url, server = false) => {
    try {
        // const area = server ? server : getRandomUsServer();
        // const area = 'US';
        const area = Math.random() < 0.5 ? 'US' : 'VN';
        return await luminaExec(url, area);
    } catch (error) {
        console.log('Error:', error.message);
    }
}

const useProxySite = async (url, server = false) => {
    try {
        const usServer = server ? server : getRandomUsServer();
        const headers = await postToProxySite(usServer, url);
        return await amzExecute(headers.location, headers.setCookie);
    } catch (error) {
        console.log('Error:', error.message);
    }
}

const useWorker = async (urlArr, maxRetries = 3) => {
    return new Promise(async (resolve, reject) => {
        const baseUrl = `http://34.67.190.249/api/app/v1/native/request`
        const urls = {
            urls: urlArr
        }
        const options = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(urls)
        };

        const fetchData = async (retryCount) => {
            try {
                await randomDelay(100, 500);
                const response = await fetch(baseUrl, options);
                const data = await response.json();
                resolve(data.results);

            } catch (error) {
                if (retryCount > 0) {
                    fetchData(retryCount - 1);
                } else {
                    reject(error);
                }
            }
        };

        await randomDelay(1000, 3000);
        fetchData(maxRetries);
    });
}

module.exports = { useScraperApiExec, scrapeRandomMethod, useLuminaProxy, useProxySite, useWorker,useSphereProvider };
