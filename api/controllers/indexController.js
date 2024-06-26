const getListOfTools = async (req, res, next) => {
    try {
        let tools = [
            {
                name: "ASIN Checker V2",
                subname: "asin-checker-v2",
                description: "Lorem ipsum dolor sit amet consectetur adipisicing elit.",
                active: true,
            },
            {
                name: "Listing Loader V2",
                subname: "listing-loader-v2",
                description: "ipsum dolor sit amet consectetur adipisicing elit.",
                active: true,
            },
            
        ];
        res.status(200).json({ tools });
    } catch (error) {
        next(error);
    }
}

module.exports = { getListOfTools };