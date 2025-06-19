module.exports = function (app) {
    const expressSwagger = require('express-swagger-generator')(app)
  
    let options = {
      swaggerDefinition: {
        info: {
          description: 'Api Documentation',
          title: 'MCL Api',
          version: '1.0.0'
        },
        host: process.env.HOST,
        basePath: '/api',
        produces: ['application/json'],
        schemes: [process.env.PROTOCOL],
        securityDefinitions: {
          User: {
            type: 'apiKey',
            in: 'header',
            name: 'Authorization',
            description: ''
          }
        }
      },
      basedir: __dirname, //app absolute path
      files: ['./../routes/*.js'] //Path to the API handle folder
    }
    expressSwagger(options)
  }
  