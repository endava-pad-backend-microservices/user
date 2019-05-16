import "reflect-metadata"; // this shim is required
import { createExpressServer, getMetadataArgsStorage } from "routing-controllers";
import { createConnection } from "typeorm";
import { getFromContainer, MetadataStorage, validateSync } from 'class-validator';
import { validationMetadatasToSchemas } from 'class-validator-jsonschema';
import path = require('path');
const Eureka = require('eureka-js-client').Eureka;
const config = require(path.join(__dirname, '../ormconfig.js'))
import { routingControllersToSpec } from 'routing-controllers-openapi'
import * as swaggerUi from 'swagger-ui-express';
var fs = require('fs');


createConnection(config).then(async connection => {
  const client = new Eureka({
    // application instance information
    instance: {
      id: 'users',
      instanceId: 'users',
      app: 'USERS',
      hostName: process.env.SERVER_URL,
      ipAddr: process.env.SERVER_URL,
      vipAddress: 'users',
      secureVipAddress: 'users',
      status: "STARTING",
      port: {
        '$': 8084,
        '@enabled': true,
      },
      dataCenterInfo: {
        '@class': "com.netflix.appinfo.InstanceInfo$DefaultDataCenterInfo",
        'name': "MyOwn"
      }
    },
    eureka: {
      // eureka server host / port
      host: process.env.EUREKA_URL,
      port: 8761,
      servicePath: '/eureka/apps/'
    },
  });

  const routingControllersOptions = {
    cors: true,
    routePrefix: "",
    controllers: [__dirname + "/controllers/*.ts"]
  };




  // Parse class-validator classes into JSON Schema:
  const metadatas = (getFromContainer(MetadataStorage) as any).validationMetadatas;

  const schemas = validationMetadatasToSchemas(metadatas, {
    refPointerPrefix: '#/components/schemas/'
  });



  const app = createExpressServer(routingControllersOptions);

  const storage = getMetadataArgsStorage();

  const spec = routingControllersToSpec(storage, routingControllersOptions, {
    components: {
      schemas
    },
    info: {
      description: 'A microservice written in NodeJS',
      title: 'Users Management Microservice',
      version: '1.0.0'
    },

  })

  // Generate swagger file
  fs.writeFileSync('./swagger.json', JSON.stringify(spec));

  const swaggerDocument = require('../swagger.json');
  app.use('/api/users/v2/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));



  // run express application on port 3000
  app.listen(8084);

  console.log('App is ready');


  client.logger.level('debug');

  client.start();
});







