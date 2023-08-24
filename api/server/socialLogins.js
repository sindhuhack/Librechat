const express = require('express');
const session = require('express-session');
const passport = require('passport');
const {
  googleLogin,
  githubLogin,
  discordLogin,
  facebookLogin,
  setupOpenId,
} = require('../strategies');

const app = express();

const configureSocialLogins = (app) => {
  if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
    passport.use(googleLogin());
  }
  if (process.env.FACEBOOK_CLIENT_ID && process.env.FACEBOOK_CLIENT_SECRET) {
    passport.use(facebookLogin());
  }
  if (process.env.GITHUB_CLIENT_ID && process.env.GITHUB_CLIENT_SECRET) {
    passport.use(githubLogin());
  }
  if (process.env.DISCORD_CLIENT_ID && process.env.DISCORD_CLIENT_SECRET) {
    passport.use(discordLogin());
  }
  if (
    process.env.OPENID_CLIENT_ID &&
    process.env.OPENID_CLIENT_SECRET &&
    process.env.OPENID_ISSUER &&
    process.env.OPENID_SCOPE &&
    process.env.OPENID_SESSION_SECRET
  ) {
    app.use(
      session({
        secret: process.env.OPENID_SESSION_SECRET,
        resave: false,
        saveUninitialized: false,
      }),
    );
    app.use(passport.session());
    setupOpenId();
  }
};

if (process.env.ALLOW_SOCIAL_LOGIN === 'true') {
  configureSocialLogins(app);
}

module.exports = configureSocialLogins;
