import "reflect-metadata"; // this shim is required
import { createExpressServer } from "routing-controllers";
import { createConnection } from "typeorm";
import path = require('path');
const Eureka = require('eureka-js-client').Eureka;
const config = require(path.join(__dirname, '../ormconfig.js'))



// creates express app, registers all controller routes and returns you express app instance

// create connection with database
// note that it's not active database connection
// TypeORM creates connection pools and uses them for your requests
// createConnection(config)
//   .then(async connection => {
//     const app = createExpressServer({
//       cors: true,
//       routePrefix: "/api",
//       controllers: [__dirname + "/controllers/*.ts"]
//     });

//     // run express application on port 3000
//     app.listen(8084);
//   })
//   .catch(error => console.log("TypeORM connection error: ", error));

// example configuration
const client = new Eureka({
  // application instance information
  instance: {
    id: 'users',
    instanceId: 'users',
    app:'USERS',
    hostName: process.env.SERVER_URL,
    ipAddr: '127.0.0.1',
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

client.logger.level('debug');

client.start();



const app = createExpressServer({
  cors: true,
  routePrefix: "",
  controllers: [__dirname + "/controllers/*.ts"]
});

// run express application on port 3000
app.listen(8084);

console.log('App is ready');