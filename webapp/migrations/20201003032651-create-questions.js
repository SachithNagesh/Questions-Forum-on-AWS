"use strict";
module.exports = {
  up: async (queryInterface, Sequelize) => {
    const DataTypes = Sequelize.DataTypes;

    await queryInterface.createTable("Questions", {
      id: {
        type: DataTypes.UUID,
        default: Sequelize.UUIDV4,
        allowNull: false,
        primaryKey: true,
      },
      question_text: {
        type: Sequelize.STRING,
      },
      user_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: "Users",
          key: "id",
        },
      },
      question_created: {
        allowNull: false,
        type: Sequelize.DATE,
        field: "question_created",
      },
      question_updated: {
        allowNull: false,
        type: Sequelize.DATE,
        field: "question_updated",
      },
    });
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable("Questions");
  },
};
