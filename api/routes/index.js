const validateRequest = require('./route_guard');

const initRoutes = ({ app }) => {
    app.use('/api/v1/tools', validateRequest, require('./tools_routes'));
    app.use('/api/v1/batch', validateRequest, require('./batch_routes'));
    app.use((error, req, res, next) => 
        res.status(error.status || 500).json({
            message: error.message || 'API Route: Something Went Wrong'
        })
    );
};

module.exports = { initRoutes };