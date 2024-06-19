const initRoutes = ({ app }) => {
    app.use('/api/v1/tools', require('./tools_routes'));
    app.use('/api/v1/batch', require('./batch_routes'));
    app.use((error, req, res, next) => 
        res.status(error.status || 500).json({
            message: error.message || 'API Route: Something Went Wrong'
        })
    );
};

module.exports = { initRoutes };