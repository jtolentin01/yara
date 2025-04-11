
const getRandomQuotes = async (req, res, next) => {
    try {
        const maxRetries=3
        return new Promise(async (resolve, reject) => {
            const baseUrl = `https://zenquotes.io/api/random`;
            const options = {
                method: 'get',
            };
            const fetchData = async (retryCount) => {
                try {
                    const response = await fetch(baseUrl, options);
                    const data = await response.json();
                    resolve(res.status(200).json(data))
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
    } catch (error) {
        next(error);
    }
}

module.exports = { getRandomQuotes };
