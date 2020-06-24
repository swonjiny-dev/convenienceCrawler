const Sequelize = require('sequelize');
const env = process.env.NODE_ENV || 'development';
const config = require('../config/db')[env];
const db = {};

const sequelize = new Sequelize(config.database, config.username, config.password, config);

db.Product = require('./prod')(sequelize, Sequelize);
db.Category = require('./category')(sequelize, Sequelize);

// Object.keys(db).forEach(modelName => {
//   if (db[modelName].associate) {
//     db[modelName].associate(db);
//   }
// });

db.sequelize = sequelize;
db.Sequelize = Sequelize;

db.sequelize.sync({force: false});

module.exports = db;