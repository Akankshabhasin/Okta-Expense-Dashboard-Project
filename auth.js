import * as client from "openid-client";
import "dotenv/config";

const ALL_TEAMS_NAME = "Advocacy, Support, Dev Success"

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

function getModifiedDepartment(departmentVal) {
  return departmentVal?.trim()
    ? departmentVal === "admin"
      ? ALL_TEAMS_NAME.split(",").map((teamName) => ({
          id: teamName.trim().toLowerCase().split(" ").join("-"),
          label: teamName,
        }))
      : [
          {
            id: departmentVal.split(" ").join("-").toLowerCase(),
            label: departmentVal.charAt(0).toUpperCase() + departmentVal.slice(1),
          },
        ]
    : [];
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

    const { sub } = tokenSet.claims();
    const userInfo = await client.fetchUserInfo(openIdClientConfig, tokenSet.access_token, sub);

    const departmentVal = userInfo.department || "";

    const userProfile = {
      profile: {
        ...userInfo,
        idToken: tokenSet.id_token,
        team: getModifiedDepartment(departmentVal),
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
