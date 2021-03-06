/* WARNING:
   This file gets autogenerated by salt and added to the build
 */

var hostname = process.env.HOSTNAME || 'localhost';
var whitelist = ['http://localhost', 'http://' + hostname, 'http://' + hostname + ':8006', 'http://0.0.0.0:8006'];
module.exports = {
  whitelist: whitelist,
  deployment_manager: {
    host: "http://deployment-manager:5000",
    API: {
      endpoints: "/environment/endpoints",
      packages_available: "/repository/packages?recency=999",
      packages: "/packages",
      applications: "/applications"
    }
  },
  dataset_manager: {
    host: "http://localhost:7000",
    API: {
      datasets: "/api/v1/datasets"
    }
  },
  session: {
    secret: "data-manager-secret",
    max_age: 60000
  }
};
