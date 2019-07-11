import "reflect-metadata"; // this shim is required
const appzip = require('appmetrics-zipkin')({
  host: process.env.TRACING_URL,
  port: process.env.TRACING_PORT,
  serviceName: "users",
  sampleRate: 1.0,
});
import { createExpressServer, getMetadataArgsStorage } from "routing-controllers";
import { createConnection } from "typeorm";
import { getFromContainer, MetadataStorage } from 'class-validator';
import { validationMetadatasToSchemas } from 'class-validator-jsonschema';
import path = require('path');
import { Eureka } from 'eureka-js-client';
import cloudConfigClient = require("cloud-config-client");

const config = require(path.join(__dirname, '../ormconfig.js'))
import { routingControllersToSpec } from 'routing-controllers-openapi';
import { UserController } from './user.controller'
import { RoleController } from './role.controller'
import { Request, Response } from 'express';
import healthcheck = require('healthcheck-middleware');
import Converter = require('api-spec-converter');
import * as swaggerUi from 'swagger-ui-express';

import fs = require('fs');


const APP_LISTEN_PORT = 8084;


createConnection(config).then(async connection => {
  const client = new Eureka({
    // application instance information

    eureka: {
      // eureka server host / port
      host: process.env.EUREKA_URL,
      port: 8761,
      servicePath: '/eureka/apps/',
    },

    instance: {
      app: 'USERS',
      healthCheckUrl: 'http://' + process.env.SERVER_URL + ':8084/healthcheck',
      dataCenterInfo: {
        '@class': "com.netflix.appinfo.InstanceInfo$DefaultDataCenterInfo",
        'name': "MyOwn",
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
    controllers: [UserController,RoleController],
    cors: true,
    routePrefix: "",
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
      schemas,
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

  app.get('/v2/api-docs', (req: Request, res: Response) => {
    res.header('Content-Type', 'application/json');

    Converter.convert({
      from: 'openapi_3',
      source: './swagger.json',
      to: 'swagger_2',
    }).then((converted: any) => {
      converted.fillMissing();
      const options = {
        synax: 'json',
        order: 'openapi',
      };

      res.header('Content-Type', 'application/json');
      res.json(JSON.parse(converted.stringify(options)));
    })


  });

  app.use('/healthcheck', healthcheck());


  cloudConfigClient.load({
    context: process.env,
    endpoint: 'http://pad-b-config:8086',
    name: 'dev',
    profiles: 'dev',
    label: 'configuration',
    application: 'configuration',
    version: '1.0.2',
  }).then(config => {
    process.env['BCRYPT_HASH'] = config.properties["users.bcrypt-hash-size"];
    process.env["HASH_EXPIRE_TIME"] = config.properties["users.hash-expire-time"];
  })

  // run express application on port 3000
  app.listen(APP_LISTEN_PORT);

  console.log('App is ready');

  client.start();
});







