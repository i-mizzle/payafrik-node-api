'use strict';
const swaggerUi = require('swagger-ui-express');
const swaggerDocument = require('../swagger');

module.exports = (app) => {
    // swager Documentation route
    app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
    app.use('/v1/api', require('./v1_routes'));
    app.get('/', (req, res) => res.status(200).json({ status: "OK" }));
};
