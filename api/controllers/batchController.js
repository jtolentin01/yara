const newBatch = async (req, res, next) => {
    try {
        // const { importName, productIDs, productType } = req.body;
        
        res.status(200).json({ success: true});
    } catch (error) {
        next(error);
    }
}

module.exports = { newBatch };
