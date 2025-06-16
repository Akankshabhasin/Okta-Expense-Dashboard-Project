import passport from "passport";
import { Strategy as OIDCStrategy } from "passport-openidconnect";
import jwt from "jsonwebtoken";
import "dotenv/config";

const ALL_TEAMS_NAME = process.env.ALL_TEAMS_NAME;

function setupOIDC() {
  passport.use(
    "oidc",
    new OIDCStrategy(
      {
        issuer: process.env.OKTA_ISSUER,
        authorizationURL: `${process.env.OKTA_ISSUER}/v1/authorize`,
        tokenURL: `${process.env.OKTA_ISSUER}/v1/token`,
        userInfoURL: `${process.env.OKTA_ISSUER}/v1/userinfo`,
        clientID: process.env.OKTA_CLIENT_ID,
        clientSecret: process.env.OKTA_CLIENT_SECRET,
        callbackURL: `${process.env.APP_BASE_URL}/authorization-code/callback`,
        scope: "openid profile email offline_access department",
      },
      function (issuer, profile, context, idToken, accessToken, refreshToken, done) {
        const decoded = jwt.decode(idToken);
        const departmentVal = decoded.department;

        const departmentObject =
          departmentVal === "all"
            ? ALL_TEAMS_NAME.split(",").map((teamName) => ({
                id: teamName.trim().toLowerCase().split(" ").join("-"),
                label: teamName,
              }))
            : [
                {
                  id: departmentVal.split(" ").join("-").toLowerCase(),
                  label: departmentVal.charAt(0).toUpperCase() + departmentVal.slice(1),
                },
              ];

        profile = {
          ...profile,
          department: departmentVal,
          teams: departmentObject,
          accessToken,
          idToken,
          refreshToken,
        };

        console.dir(profile, { depth: null });

        return done(null, { profile });
      }
    )
  );

  passport.serializeUser(function (user, done) {
    done(null, user);
  });
  passport.deserializeUser(function (obj, done) {
    done(null, obj);
  });
}

export default setupOIDC;