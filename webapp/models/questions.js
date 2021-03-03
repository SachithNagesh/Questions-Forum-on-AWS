"use strict";
const { Model, Sequelize } = require("sequelize");

const User = require("./").User;
const Category = require("./").Category;

module.exports = (sequelize, DataTypes) => {
  class Questions extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
 
    }
  }
  Questions.init(
    {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV1,
        primaryKey: true,
      },
      question_text: DataTypes.STRING,
      user_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: "User",
          key: "id",
        },
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
        field: "question_created",
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
        field: "question_updated",
      },
    },
    {
      sequelize,
      modelName: "Questions",
    }
  );

  return Questions;
};
