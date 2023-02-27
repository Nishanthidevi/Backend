const apiRoutes = function(app) {
    // api routes
    app.use('/api/users', require('../controllers/index'));       
}

module.exports = {
    apiRoutes
}