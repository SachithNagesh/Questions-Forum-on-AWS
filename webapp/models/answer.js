"use strict";
const { Model, Sequelize } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Answer extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  Answer.init(
    {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV1,
        primaryKey: true,
      },
      user_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: "User",
          key: "id",
        },
      },
      question_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: "Category",
          key: "id",
        },
      },
      answer_text: DataTypes.STRING,
    },
    {
      sequelize,
      modelName: "Answer",
    }
  );
  return Answer;
};
