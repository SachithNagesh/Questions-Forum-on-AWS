var express = require("express");
var router = express.Router();
const passport = require("passport");
const jwt = require("jsonwebtoken");
require("../config/passport")(passport);
const User = require("../models").User;
const StatsD = require("node-statsd");
const statsClient = new StatsD();
const logger = require('../config/winston');


/* POST route for users to sign-up */
router.post("/", function (req, res) {

  const start = Date.now();
  logger.info('POST ​/v1​/user called')
  statsClient.increment('user_signup_counter');


  if (
    !req.body.email_address ||
    !req.body.password ||
    !req.body.first_name ||
    !req.body.last_name
  ) {
    return res.status(400).set("Content-Type", "application/json").send({
      message:
        "Please pass all fields: email_address, password, first_name, last_name",
    });
  } else {
    
    const findUserStart = Date.now();

    User.findOne({
      where: {
        email_address: req.body.email_address.toLowerCase(),
      },
    })
      .then((user) => {

        const findUserEnd = Date.now();
        statsClient.timing('user_signup_find_user_db', findUserEnd-findUserStart )

        if (!user) {
          const passwordTester = new RegExp(
            "^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*])(?=.{8,})"
          );

          const emailTester = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

          if (
            passwordTester.test(req.body.password) &&
            emailTester.test(req.body.email_address.toLowerCase())
          ) {
            
            const createUserStart = Date.now();

            User.create({
              email_address: req.body.email_address.toLowerCase(),
              password: req.body.password,
              first_name: req.body.first_name,
              last_name: req.body.last_name,
            })
              .then((user) => {

                const createUserEnd= Date.now();

                statsClient.timing('user_signup_create_user_db', createUserEnd-createUserStart )

                const end = Date.now()
                statsClient.timing('user_signup_timing', end-start)

                return res
                  .status(201)
                  .set("Content-Type", "application/json")
                  .send(userResponsePayload(user));
              })
              .catch((error) => {
                console.log(error);
                logger.info(error)
                const end = Date.now()
                statsClient.timing('user_signup_timing', end-start)
                return res
                  .status(400)
                  .set("Content-Type", "application/json")
                  .send(error);
              });
          } else {
            !emailTester.test(req.body.email_address.toLowerCase()) &&
              res.status(400).set("Content-Type", "application/json").send({
                message: "Please provide a valid email",
              });

            !passwordTester.test(req.body.password) &&
              res.status(400).set("Content-Type", "application/json").send({
                message:
                  "Please provide a strong password that contains atleast 1 numerical, lowercase, uppercase alphabetic charater with one special charater and 8 charaters long.",
              });

            const end = Date.now()
            statsClient.timing('user_signup_timing', end-start)
          }
        } else {
          const end = Date.now()
          statsClient.timing('user_signup_timing', end-start)
          return res.status(400).set("Content-Type", "application/json").send({
            message: "Email address already exists",
          });
        }
      })
      .catch((error) =>
        res.status(400).set("Content-Type", "application/json").send(error)
      );
  }


});

// Get route for users to view profile
router.get("/self", function (req, res, next) {
  passport.authenticate("basic", { session: false }, function (
    err,
    user,
    info
  ) {
    
    const start = Date.now()
    logger.info('GET ​/v1​/user/self called')
    statsClient.increment('user​_information_self_counter');

    if (err) {
      return res
        .status(401)
        .set("Content-Type", "application/json")
        .send({ message: err });
    }
    if (!user) {
      return res
        .status(401)
        .set("Content-Type", "application/json")
        .send({ message: "Unauthorized" });
    }

    const end = Date.now();
    statsClient.timing('user​_information_self_timing', end-start)
    console.log(end-start)
    return res.status(200).send(userResponsePayload(user));
  })(req, res, next);
});

// Get route for users to view profile
router.get("/:userId", function (req, res, next) {

  let start = Date.now()
  logger.info('GET ​/v1​/user/:userID called')
  statsClient.increment('user_information_by_id_counter');

  let findUserStart = Date.now();
  User.findOne({
    where: {
      id: req.params.userId,
    },
  })
    .then((user) => {
      let findUserEnd = Date.now();
      statsClient.timing('user_information_by_id_timing', findUserEnd-findUserStart)

      let end = Date.now();
      statsClient.timing('user_information_by_id_timing', end-start)
      return res
        .status(200)
        .set("Content-Type", "application/json")
        .send(userResponsePayload(user));
    })
    .catch((error) =>
      res
        .status(404)
        .set("Content-Type", "application/json")
        .send({ message: "User not found" })
    );
});

// Update route for users to update profile
router.put("/self", function (req, res, next) {
  passport.authenticate("basic", { session: false }, function (
    err,
    user,
    info
  ) {

    const start = Date.now()
    logger.info('PUT ​/v1​/user/self called')
    statsClient.increment('user_information_update_counter');

    if (err) {
      let end = Date.now()
      statsClient.timing('user_information_update_timing', end-start)

      return res
        .status(401)
        .set("Content-Type", "application/json")
        .send({ message: err });
    }
    if (!user) {
      let end = Date.now()
      statsClient.timing('user_information_update_timing', end-start)

      return res
        .status(401)
        .set("Content-Type", "application/json")
        .send({ message: err });
    }

    for (var prop in req.body) {
      if (
        prop === "first_name" ||
        prop === "password" ||
        prop === "last_name" ||
        prop === "email_address"
      ) {
        // do nothing
      } else {

        let end = Date.now()
        statsClient.timing('user_information_update_timing', end-start)

        return res.status(400).set("Content-Type", "application/json").send({
          message: "Can update only password, first_name and last_name fields",
        });
      }
    }

    if (
      !req.body.email_address ||
      !req.body.password ||
      !req.body.first_name ||
      !req.body.last_name
    ) {
      let end = Date.now()
      statsClient.timing('user_information_update_timing', end-start)
      return res.status(400).set("Content-Type", "application/json").send({
        message:
          "Please pass all fields: email_address, password, first_name and last_name",
      });
    }

    if (
      user.email_address.toLowerCase() !== req.body.email_address.toLowerCase()
    ) {

      let end = Date.now()
      statsClient.timing('user_information_update_timing', end-start)

      return res
        .status(400)
        .set("Content-Type", "application/json")
        .send({ message: "Cannot update another user's information" });
    }

    let findUserStart = Date.now()

    User.findOne({
      where: {
        email_address: user.email_address.toLowerCase(),
      },
    }).then((user) => {

      let findUserEnd = Date.now()
      statsClient.timing('user_information_update_db_find_user_timing', findUserEnd-findUserStart)

      // If password exits, then update password and other fields.
      // if not, then just update the other two fields.
      if (req.body.password) {
        var passwordTester = new RegExp(
          "^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*])(?=.{8,})"
        );

        if (passwordTester.test(req.body.password)) {

          let updateUserStart = Date.now();

          user
            .update({
              password: req.body.password,
              first_name: req.body.first_name
                ? req.body.first_name
                : user.first_name,
              last_name: req.body.last_name
                ? req.body.last_name
                : user.last_name,
            })
            .then((user) =>{

              let updateUserEnd = Date.now();
              statsClient.timing('user_information_update_db_user_update_timing', updateUserEnd-updateUserStart)

              let end = Date.now()
              statsClient.timing('put_v1​_user​_self_timing', end-start)

              return res
                .status(204)
                .set("Content-Type", "application/json")
                .send({ message: "Success" })}
            )
            .catch((error) => {

              let end = Date.now()
              statsClient.timing('user_information_update_timing', end-start)

              console.log(error);
              logger.info(error);

              return res
                .status(400)
                .set("Content-Type", "application/json")
                .send(error);
            });
        } else {

          let end = Date.now()
          statsClient.timing('user_information_update_timing', end-start)

          return res.status(400).set("Content-Type", "application/json").send({
            message:
              "Please choose a strong password that contains atleast 1 numerical, lowercase, uppercase alphabetic charater with one special charater and 8 charaters long.",
          });
        }
      } else {
        
        let updateUserStart = Date.now();

        user
          .update({
            first_name: req.body.first_name
              ? req.body.first_name
              : user.first_name,
            last_name: req.body.last_name ? req.body.last_name : user.last_name,
          })
          .then((user) =>{

            let updateUserEnd = Date.now();
            statsClient.timing('user_information_update_db_user_update_timing', updateUserEnd-updateUserStart)

            let end = Date.now()
            statsClient.timing('user_information_update_timing', end-start)

            return res.status(204).set("Content-Type", "application/json").send({})
          }
          )
          .catch((error) => {

            let end = Date.now()
            statsClient.timing('user_information_update_timing', end-start)

            console.log(error);
            logger.info(error);

            return res
              .status(400)
              .set("Content-Type", "application/json")
              .send({ message: error });
          });
      }
    });
  })(req, res, next);
});

userResponsePayload = function (user) {
  let userPayload = {
    id: user.id,
    first_name: user.first_name,
    last_name: user.last_name,
    username: user.email_address,
    account_created: user.createdAt,
    account_updated: user.updatedAt,
  };

  return userPayload;
};

getToken = function (headers) {
  if (headers && headers.authorization) {
    var parted = headers.authorization.split(" ");
    if (parted.length === 2) {
      return parted[1];
    } else {
      return null;
    }
  } else {
    return null;
  }
};

module.exports = router;
