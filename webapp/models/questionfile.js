"use strict";
const { Model, Sequelize } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class QuestionFile extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  QuestionFile.init(
    {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV1,
        primaryKey: true,
      },
      question_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: "Questions",
          key: "id",
        },
      },
      metadata: {
        type: DataTypes.JSONB,
        allowNull: false,
      },
      pathname: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      filename: {
        type: DataTypes.STRING,
        allowNull: false,
      },
    },
    {
      sequelize,
      modelName: "QuestionFile",
    }
  );
  return QuestionFile;
};
