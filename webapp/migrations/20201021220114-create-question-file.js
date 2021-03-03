"use strict";
module.exports = {
  up: async (queryInterface, Sequelize) => {
    const DataTypes = Sequelize.DataTypes;

    await queryInterface.createTable("QuestionFiles", {
      id: {
        type: DataTypes.UUID,
        default: Sequelize.UUIDV4,
        allowNull: false,
        primaryKey: true,
      },
      question_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: "Questions",
          key: "id",
        },
      },
      metadata: {
        type: Sequelize.JSONB,
        allowNull: false,
      },
      pathname: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      filename: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
    });
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable("QuestionFiles");
  },
};
