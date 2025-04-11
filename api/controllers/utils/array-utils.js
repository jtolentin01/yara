const extractUniqueValues = (data, property = null) => {
    const uniqueValues = new Set();

    data.forEach((entry) => {
        if (typeof entry === 'object' && entry !== null && property) {
            const value = entry[property];
            if (value && value !== '-') {
                uniqueValues.add(value);
            }
        } else if (!property && entry !== '-') {
            uniqueValues.add(entry);
        }
    });

    return [...uniqueValues];
};

const chunkArray = (array, size) => {
    const chunks = [];
    for (let i = 0; i < array.length; i += size) {
        chunks.push(array.slice(i, i + size));
    }
    return chunks;
};




module.exports = { extractUniqueValues,chunkArray }