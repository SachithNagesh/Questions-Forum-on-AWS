require("dotenv").config(); // this is important!
const fs = require('fs');
const tls = require('tls');
const rdsCa = fs.readFileSync('./rds-ca-2019-root.pem');
console.log(rdsCa);
console.log(process.env.RDS_HOSTNAME);

module.exports = {
  development: {
    username: process.env.RDS_USERNAME,
    password: process.env.RDS_PASSWORD,
    database: process.env.RDS_DB_NAME,
    host: process.env.RDS_HOSTNAME,
    dialect: "postgres",
    dialectOptions: {
      ssl: {
        rejectUnauthorized: true,
        ca: [rdsCa],
        checkServerIdentity: (host, cert) => {
          const error = tls.checkServerIdentity(host, cert);
          if (error && !cert.subject.CN.endsWith(".rds.amazonaws.com")) {
            return error;
          }
        },
      },
    },
  },
  test: {
    username: process.env.RDS_USERNAME,
    password: process.env.RDS_PASSWORD,
    database: process.env.RDS_DB_NAME,
    host: process.env.RDS_HOSTNAME,
    dialect: "postgres",
    dialectOptions: {
      ssl: {
        rejectUnauthorized: true,
        ca: [rdsCa],
        checkServerIdentity: (host, cert) => {
          const error = tls.checkServerIdentity(host, cert);
          if (error && !cert.subject.CN.endsWith(".rds.amazonaws.com")) {
            return error;
          }
        },
      },
    },
  },
  production: {
    username: process.env.RDS_USERNAME,
    password: process.env.RDS_PASSWORD,
    database: process.env.RDS_DB_NAME,
    host: process.env.RDS_HOSTNAME,
    dialect: "postgres",
    dialectOptions: {
      ssl: {
        rejectUnauthorized: true,
        ca: [rdsCa],
        checkServerIdentity: (host, cert) => {
          const error = tls.checkServerIdentity(host, cert);
          if (error && !cert.subject.CN.endsWith(".rds.amazonaws.com")) {
            return error;
          }
        },
      },
    },
  },
};
