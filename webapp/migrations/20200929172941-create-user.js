"use strict";
module.exports = {
  up: async (queryInterface, Sequelize) => {
    const DataTypes = Sequelize.DataTypes;

    await queryInterface.createTable("Users", {

      id: {
        type: DataTypes.UUID,
        default: Sequelize.UUIDV4,
        allowNull: false,
        primaryKey: true,
      },
      email_address: {
        unique: true,
        type: Sequelize.STRING,
      },
      password: {
        type: Sequelize.STRING,
      },
      first_name: {
        type: Sequelize.STRING,
      },
      last_name: {
        type: Sequelize.STRING,
      },
      account_created: {
        allowNull: false,
        type: Sequelize.DATE,
        field: "account_created",
      },
      account_updated: {
        allowNull: false,
        type: Sequelize.DATE,
        field: "account_updated",
      },
    });
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable("Users");
  },
};
