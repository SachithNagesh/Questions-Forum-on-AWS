'use strict';

const { v1: uuidv1 } = require('uuid');

const bcrypt = require("bcrypt-nodejs");

module.exports = {
  up: async (queryInterface, Sequelize) => {
    /**
     * Add seed commands here.
     *
     * Example:
     * await queryInterface.bulkInsert('People', [{
     *   name: 'John Doe',
     *   isBetaMember: false
     * }], {});
    */
   return queryInterface.bulkInsert('Users', [{
    id: uuidv1(),
    first_name: 'John',
    last_name: 'Doe',
    email_address: 'john@doe.com',
    password: bcrypt.hashSync(
      'John@12345',
      bcrypt.genSaltSync(10),
      null
    ),
    account_created: new Date(),
    account_updated: new Date()
  }]);
  },

  down: async (queryInterface, Sequelize) => {
    /**
     * Add commands to revert seed here.
     *
     * Example:
     * await queryInterface.bulkDelete('People', null, {});
     */
    return queryInterface.bulkDelete('Users', null, {});
  }
};
