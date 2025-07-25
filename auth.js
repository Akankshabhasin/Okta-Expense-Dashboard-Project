import * as client from "openid-client";
import "dotenv/config";

import { userTeamMap, getModifiedTeam } from './utils.js';

export function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect("/login");
}

function getCallbackUrlWithParams(req) {
  const host = req.headers["x-forwarded-host"] || req.headers.host || "localhost";
  const protocol = req.headers["x-forwarded-proto"] || req.protocol;
  const currentUrl = new URL(`${protocol}://${host}${req.originalUrl}`);
  return currentUrl;
}

async function getClientConfig() {
  return await client.discovery(new URL(process.env.OKTA_ISSUER), process.env.OKTA_CLIENT_ID, process.env.OKTA_CLIENT_SECRET);
}

export async function login(req, res) {
  try {
    const openIdClientConfig = await getClientConfig();

    const code_verifier = client.randomPKCECodeVerifier();
    const code_challenge = await client.calculatePKCECodeChallenge(code_verifier);
    const state = client.randomState();

    req.session.pkce = { code_verifier, state };
    req.session.save(); 

    const authUrl = client.buildAuthorizationUrl(openIdClientConfig, {
      scope: "openid profile email offline_access",
      state,
      code_challenge,
      code_challenge_method: "S256",
      redirect_uri: `${process.env.APP_BASE_URL}/authorization-code/callback`,
    });

    res.redirect(authUrl);
  } catch (error) {
    res.status(500).send("Something failed during the authorization request");
  }
}

export async function authCallback(req, res, next) {
  try {
    const openIdClientConfig = await getClientConfig();

    const { pkce } = req.session;

    if (!pkce || !pkce.code_verifier || !pkce.state) {
      throw new Error("Login session expired or invalid. Please try logging in again.");
    }

    const tokenSet = await client.authorizationCodeGrant(openIdClientConfig, getCallbackUrlWithParams(req), {
      pkceCodeVerifier: pkce.code_verifier,
      expectedState: pkce.state,
    });

    const { name, email } = tokenSet.claims();
    console.log(tokenSet.claims())


    const teams = getModifiedTeam(userTeamMap[email]);


    console.log(userTeamMap[email])
    console.log(tokenSet)


    const userProfile = {
      name,
      email,
      teams,
      idToken: tokenSet.id_token,
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

export async function logout(req, res) {
  try {
    const openIdClientConfig = await getClientConfig();

    const id_token_hint = req.user?.idToken;

    const logoutUrl = client.buildEndSessionUrl(openIdClientConfig, {
      id_token_hint,
      post_logout_redirect_uri: process.env.POST_LOGOUT_URL,
    });

    req.logout((err) => {
      if (err) return next(err);

      req.session.destroy((err) => {
        if (err) return next(err);
        res.redirect(logoutUrl);
      });
    });
  } catch (error) {
    res.status(500).send('Something went wrong during logout.');
  }
}
