const testController = async (req, res, next) => {
    try {
        console.log('received!');
        res.status(200).json({success:true});
    } catch (error) {
        next(error);
    }
}

module.exports = { testController };