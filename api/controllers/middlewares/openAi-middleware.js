const openAichatExec = async (chatHistory, maxRetries = 3) => {
    return new Promise(async (resolve, reject) => {
        const baseUrl = `https://api.openai.com/v1/chat/completions`
        const options = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${process.env.OPEN_AI_KEY}`
            },
            body: JSON.stringify({
                model: "gpt-4",
                messages: chatHistory,
                temperature: 0.7
            })
        };

        const fetchData = async (retryCount) => {
            try {
                const response = await fetch(baseUrl, options);
                const messageData = await response.json();
                const responseMessage = messageData?.choices?.[0]?.message;
                resolve(responseMessage);

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

module.exports = openAichatExec;