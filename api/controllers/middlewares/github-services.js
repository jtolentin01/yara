const getAllCommits = async (maxRetries=3) => {    
    return new Promise(async (resolve, reject) => {
        const baseUrl = `https://api.github.com/repos/channelprecision/yara/commits?per_page=100&page=1`;
        const options = {
            method: 'get',
            headers: 
            { 'Content-Type': 'application/json',
                'Authorization': `bearer ${process.env.GITHUB_API}`
            }
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

module.exports = {getAllCommits};