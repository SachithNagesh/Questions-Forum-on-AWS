"use strict";
const { Model, Sequelize } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class CategoryQuestion extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  CategoryQuestion.init(
    {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV1,
        primaryKey: true,
      },
      category_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: "Category",
          key: "id",
        },
      },
      question_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: "Questions",
          key: "id",
        },
      },
    },
    {
      sequelize,
      modelName: "CategoryQuestion",
    }
  );
  return CategoryQuestion;
};
