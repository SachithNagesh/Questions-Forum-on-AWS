'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    const DataTypes = Sequelize.DataTypes;

    await queryInterface.createTable('Answers', {
      id: {
        type: DataTypes.UUID,
        default: Sequelize.UUIDV4,
        allowNull: false,
        primaryKey: true,
      },
      user_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: "Users",
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
      answer_text: {
        type: Sequelize.STRING
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
    await queryInterface.dropTable('Answers');
  }
};