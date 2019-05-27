import "reflect-metadata"; // this shim is required
import { createExpressServer, getMetadataArgsStorage } from "routing-controllers";
import { createConnection } from "typeorm";
import { getFromContainer, MetadataStorage } from 'class-validator';
import { validationMetadatasToSchemas } from 'class-validator-jsonschema';
import path = require('path');
import { Eureka } from 'eureka-js-client';
const config = require(path.join(__dirname, '../ormconfig.js'))
import { routingControllersToSpec } from 'routing-controllers-openapi';
import { UserController } from './user.controller'

const healthcheck = require('healthcheck-middleware');
const Converter = require('api-spec-converter');
import * as swaggerUi from 'swagger-ui-express';

const fs = require('fs');





createConnection(config).then(async connection => {
  const client = new Eureka({
    // application instance information

    eureka: {
      // eureka server host / port
      host: process.env.EUREKA_URL,
      port: 8761,
      servicePath: '/eureka/apps/'
    },

    instance: {
      app: 'USERS',
      id: 'users',
      healthCheckUrl: 'http://' + process.env.SERVER_URL + ':8084/healthcheck',
      dataCenterInfo: {
        '@class': "com.netflix.appinfo.InstanceInfo$DefaultDataCenterInfo",
        'name': "MyOwn"
      },
      hostName: process.env.SERVER_URL,
      instanceId: 'users',
      ipAddr: process.env.SERVER_URL,
      statusPageUrl: 'http://' + process.env.SERVER_URL + ':8084/healthcheck',
      vipAddress: 'users',
      secureVipAddress: 'users',
      status: "STARTING",
      port: {
        '$': 8084,
        '@enabled': true,
      },

    },
  });

  const routingControllersOptions = {
    cors: true,
    routePrefix: "",
    controllers: [UserController],
  };





  // Parse class-validator classes into JSON Schema:
  const metadatas = (getFromContainer(MetadataStorage) as any).validationMetadatas;

  const schemas = validationMetadatasToSchemas(metadatas, {
    refPointerPrefix: '#/components/schemas/',
  });



  const app = createExpressServer(routingControllersOptions);

  routingControllersOptions.routePrefix = '/api/users';

  const storage = getMetadataArgsStorage();

  const spec = routingControllersToSpec(storage, routingControllersOptions, {
    components: {
      schemas
    },
    info: {
      description: 'A microservice written in NodeJS',
      title: 'Users Management Microservice',
      version: '1.0.0',
    },

  })

  // Generate swagger file
  fs.writeFileSync('./swagger.json', JSON.stringify(spec));
  
  const swaggerDocument = require('../swagger.json')

  app.use('/swagger', swaggerUi.serve, swaggerUi.setup(swaggerDocument));


  //Convert from open-api to swagger 2 for spring boot

  app.get('/v2/api-docs', function (req, res) {
    res.header('Content-Type', 'application/json');

    Converter.convert({
      from: 'openapi_3',
      source: './swagger.json',
      to: 'swagger_2',
    }).then( (converted: any) => {
      converted.fillMissing();
      const options = {
        synax: 'json',
        order: 'openapi'
      };

      res.header('Content-Type', 'application/json');
      res.json(JSON.parse(converted.stringify(options)));
    })


  });

  app.use('/healthcheck', healthcheck());


  // run express application on port 3000
  app.listen(8084);

  console.log('App is ready');

  client.start();
});







