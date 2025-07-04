import { Issuer, generators } from "openid-client";
import jwt from "jsonwebtoken";
import "dotenv/config";

const ALL_TEAMS_NAME = process.env.ALL_TEAMS_NAME;

export function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect("/login");
}

let client = null;
async function getOidcClient() {
  if (!client) {
    try {
      const issuer = await Issuer.discover(process.env.OKTA_ISSUER);

      client = new issuer.Client({
        client_id: process.env.OKTA_CLIENT_ID,
        client_secret: process.env.OKTA_CLIENT_SECRET,
        redirect_uris: [`${process.env.APP_BASE_URL}/authorization-code/callback`],
        response_types: ["code"],

      });

      console.log("OIDC client initialized successfully.");
    } catch (error) {
      console.error("Failed to discover OIDC issuer:", error);
      throw error;
    }
  }

  return client;
}

export async function login(req, res) {
  try {
    const client = await getOidcClient();

    const code_verifier = generators.codeVerifier();
    const state = generators.state();
    req.session.pkce = { code_verifier, state };
    req.session.save();

    const authUrl = client.authorizationUrl({
      scope: "openid profile email offline_access department",
      state: state,
      code_challenge: generators.codeChallenge(code_verifier),
      code_challenge_method: "S256",
    });

    res.redirect(authUrl);
  } catch (error) {
    res.status(500).send("OIDC client is not configured correctly.");
  }
}

export async function authCallback(req, res, next) {
  try {
    const client = await getOidcClient();
    const { pkce } = req.session;

    if (!pkce || !pkce.code_verifier || !pkce.state) {
      throw new Error("Login session expired or invalid. Please try logging in again.");
    }

    const params = client.callbackParams(req);

    const tokenSet = await client.callback(
      `${process.env.APP_BASE_URL}/authorization-code/callback`,
      params,
      {
        code_verifier: pkce.code_verifier,
        state: pkce.state,
      }
    );

    const userInfo = await client.userinfo(tokenSet.access_token);

    const decodedIdToken = jwt.decode(tokenSet.id_token);
    const departmentVal = decodedIdToken.department;

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

    const userProfile = {
      profile: {
        ...userInfo,
        idToken: tokenSet.id_token,
        teams: departmentObject,
        department: departmentVal,
      },
    };

    delete req.session.pkce;

    req.logIn(userProfile, (err) => {
      if (err) {
        return next(err);
      }

      return res.redirect("/dashboard");
    });
  } catch (error) {
    console.error("Authentication error:", error.message);
    return res.status(500).send(`Authentication failed: ${error.message}`);
  }
}

export function logout(req, res) {
  const id_token = req.user?.profile?.idToken;

  req.logout(() => {
    req.session.destroy(() => {
      const logoutUrl = `${process.env.OKTA_ISSUER}/v1/logout?id_token_hint=${id_token}&post_logout_redirect_uri=${process.env.POST_LOGOUT_URL}`;
      res.redirect(logoutUrl);
    });
  });
}