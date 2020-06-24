const dotenv = require('dotenv');

dotenv.config();

module.exports = {
  // 개발환경에 맞게 작성 /  호스팅업체등의 정보
  development: {
    username: process.env.DB_USERNAME_DEV,
    password: process.env.DB_PASSWORD_DEV,
    database: process.env.DB_DATABASE_DEV,
    host: process.env.DB_HOST_DEV,
    port: process.env.DB_PORT_DEV,
    dialect: 'mysql',
    timezone: "+09:00",
    pool : {
      max : 10,
      min : 0 ,
      idle: 30000
    }
  },
  production: {
    username: process.env.DB_USERNAME_PROD,
    password: process.env.DB_PASSWORD_PROD,
    database: process.env.DB_DATABASE_PROD,
    host: process.env.DB_HOST_PROD,
    port: process.env.DB_PORT_PROD,
    dialect: 'mysql',
    timezone: "+09:00",
    pool : {
      max : 10,
      min : 0 ,
      idle: 30000
    }
  },
};