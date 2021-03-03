"use strict";
const { Model, Sequelize } = require("sequelize");
const Questions = require("./").Questions;

module.exports = (sequelize, DataTypes) => {
  class Category extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      
      
    }
  }
  Category.init(
    {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV1,
        primaryKey: true,
      },
      category_text: DataTypes.STRING,
    },
    {
      sequelize,
      modelName: "Category",
    }
  );
  return Category;
};
