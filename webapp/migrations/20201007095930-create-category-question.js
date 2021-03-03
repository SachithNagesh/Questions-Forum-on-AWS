'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    const DataTypes = Sequelize.DataTypes;

    await queryInterface.createTable('CategoryQuestions', {
      id: {
        type: DataTypes.UUID,
        default: Sequelize.UUIDV4,
        allowNull: false,
        primaryKey: true,
      },
      category_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: "Categories",
          key: "id",
        },
      },
      question_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: "Questions",
          key: "id",
        },
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
    await queryInterface.dropTable('CategoryQuestions');
  }
};