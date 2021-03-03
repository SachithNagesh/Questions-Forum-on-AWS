'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    const DataTypes = Sequelize.DataTypes;

    await queryInterface.createTable('AnswerFiles', {
      id: {
        type: DataTypes.UUID,
        default: Sequelize.UUIDV4,
        allowNull: false,
        primaryKey: true,
      },
      answer_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: "Answers",
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
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('AnswerFiles');
  }
};