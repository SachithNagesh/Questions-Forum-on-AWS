'use strict';

const fs = require('fs');
const path = require('path');
const Sequelize = require('sequelize');
const basename = path.basename(__filename);
const env = process.env.NODE_ENV || 'development';
const config = require(__dirname + '/../config/config.js')[env];


const db = {};

let sequelize;
if (config.use_env_variable) {
  sequelize = new Sequelize(process.env[config.use_env_variable], config);
} else {
  sequelize = new Sequelize(config.database, config.username, config.password, config);
}

fs
  .readdirSync(__dirname)
  .filter(file => {
    return (file.indexOf('.') !== 0) && (file !== basename) && (file.slice(-3) === '.js');
  })
  .forEach(file => {
    const model = require(path.join(__dirname, file))(sequelize, Sequelize.DataTypes);
    db[model.name] = model;
  });

Object.keys(db).forEach(modelName => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

// db.User.hasMany(db.Questions);
// db.Questions.belongsTo(db.User);

//Many to Many association between Question and Categories
// db.Questions.belongsToMany(db.Category, {through: 'QuestionCategory', foreignKey: "question_id"}, );
// db.Category.belongsToMany(db.Questions, {through: 'QuestionCategory',foreignKey: "category_id"});


// Questions.hasMany(Answer, {as: "answers"});
// Answer.belongsTo(Question, { foreignKey: "question_id", as: "questions"});

// User.hasMany(Answer, {as: "answers"});
// Answer.belongsTo(User);

// sequelize.sync({ force: false });

db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;
