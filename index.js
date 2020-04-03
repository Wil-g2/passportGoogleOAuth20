//example code using facebookAuth
//https://github.com/passport/express-4.x-facebook-example
//example code using googleAuth2.0
//https://github.com/jaredhanson/passport-google-oauth2
//https://github.com/passport/express-4.x-facebook-example/blob/master/server.js
//https://github.com/passport-next/passport-google-oauth2

require("dotenv/config");
const express = require("express");
const app = express();

var GoogleStrategy = require("passport-google-oauth20").Strategy;
var passport = require("passport");

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: "http://localhost:3333/auth/google/callback",
      passReqToCallback: true
    },
    function(request, accessToken, refreshToken, profile, done) {
      /*User.findOrCreate({ googleId: profile.id }, function(err, user) {
        return cb(err, user);
      });*/
      const user = { googleId: profile.id };
      console.log(profile);
      console.log(accessToken);
      return done(null, user);
    }
  )
);

passport.serializeUser(function(user, cb) {
  cb(null, user);
});

app.use(
  require("express-session")({
    secret: "keyboard cat",
    resave: true,
    saveUninitialized: true
  })
);

// Initialize Passport and restore authentication state, if any, from the
// session.
app.use(passport.initialize());
app.use(passport.session());
const authMidlleware = function(req, res, next) {
  if (!req.user) {
    return res.redirect("/auth/google");
  }
  next();
};

passport.deserializeUser(function(obj, cb) {
  cb(null, obj);
});

app.get(
  "/auth/google",
  passport.authenticate("google", { scope: ["profile"] })
);

app.get(
  "/auth/google/callback",
  passport.authenticate("google", { failureRedirect: "/login" }),
  function(req, res) {
    // Successful authentication, redirect home.
    res.redirect("/profile");
  }
);

app.get("/profile", authMidlleware, (req, res) => {
  return res.json({ user: req.user });
});

app.listen(3333);
