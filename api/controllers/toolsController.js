const getAllTools = async (req, res, next) => {
    try {
        let result = [
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
            {
                name: "Add Product V2",
                subname: "add-product-v2",
                description: "Lorems dolor sit amet consectetur adipisicing elit.",
                active: true,
            },
            {
                name: "SIPV Scraper V2",
                subname: "sipv-scraper-v2",
                description: "Lorems dolor sit amet consectetur adipisicing elit.",
                active: true,
            },
        ];
        res.status(200).json({ result });
    } catch (error) {
        next(error);
    }
}

module.exports = { getAllTools };