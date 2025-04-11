const { batches } = require("../../models/index");

const excelToGDrive = async (batchId) => {
    return new Promise(async (resolve, reject) => {
        const baseUrl = `https://script.google.com/macros/s/AKfycbz_IVGTvMeONFwKy6xSjGbhumdeJ9TdoAYeKHSsmDa6t-mUM9-Uf98ZROvCQHdgJZHL/exec?batchId=${batchId}`;
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
                resolve(data.fileUrl);
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
};

module.exports = { excelToGDrive };
