const BasicStrategy = require("passport-http").BasicStrategy;

// load up the user model
const User = require("../models").User;

module.exports = function (passport) {

  passport.use(
    new BasicStrategy(function (email_address, password, done) {
      User.findOne({
        where: {
          email_address: email_address.toLowerCase(),
        },
      })
        .then((user) => {
          // If no user, send error.
          if (!user) {
            return done("Unauthorized: Please check your email address", false);
          }

          // If user, check password, then send appropriate response.
          user.comparePassword(password, (err, isMatch) => {
            if (isMatch && !err) {
              return done(null, user);
            } else {
              return done( "Unauthorized: Please check your password",false);
            }
          });
        })
        .catch((error) => {
          return done(null, error);
        });
    })
  );
};
