const swaggerAutogen = require('swagger-autogen')();

const outputFile = './swagger-output.json'; // Output file for Swagger JSON
const endpointsFiles = ['./routes/*.js']; // Path to your route files

const doc = {
  info: {
    title: 'Media Uploader API',
    version: '1.0.0',
    description: 'API for managing users, folders, and media files',
  },
  host: 'localhost:5000',
  basePath: '/',
  schemes: ['http'],
  securityDefinitions: {
    bearerAuth: {
      type: 'http',
      scheme: 'bearer',
      bearerFormat: 'JWT',
    },
  },
};

// Generate Swagger documentation
swaggerAutogen(outputFile, endpointsFiles, doc);