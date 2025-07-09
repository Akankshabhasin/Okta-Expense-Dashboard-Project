## Expense Dashboard Built with Express, Okta, and Passport

This project shows how to build a secure team-scoped expense dashboard with a secure login system with modern OAuth 2.0 best practices. Users see expenses only for their team, making it easy to track spending while maintaining strong security.

## Features

* OpenID Connect(OIDC) App, built with Express and Passport for flexible and secure authentication 
* Authorization Code Flow with PKCE, which is recommended for server-side and browser-based web apps
* Passwordless login support with FIDO2 and WebAuthn  
* Custom claim-based team expense dashboard view


## Prerequisites

* Node.js installed (v22+ recommended)
* [Okta Integrator Free Plan org](https://developer.okta.com/signup/)

**Table of Contents**

* [Getting Started](#getting-started)
* [Set Up Custom Claims](#set-up-custom-claims)
* [Run the Application](#run-the-application)
* [Links](#links)
* [Help](#help)
* [License](#license)

## Getting Started

**1\. Clone the repository**

```
git clone https://github.com/oktadev/okta-express-expense-dashboard-example.git
cd okta-express-expense-dashboard-example
```

**2\. Install Dependencies**

```
npm ci
```

**3\. Configure .env File**

```
OKTA_ISSUER=https://{yourOktaDomain}/oauth2/default 
OKTA_CLIENT_ID={clientId}
OKTA_CLIENT_SECRET={clientSecret}
APP_BASE_URL=http://localhost:3000
POST_LOGOUT_URL=http://localhost:3000
```

**4\. Create an OIDC Application in Okta**

1. Sign up for a free [Integrator Free Plan](https://developer.okta.com/signup/). If you already have an account, directly [login](https://developer.okta.com/login/) to the [Okta Developer Console](https://developer.okta.com/signup/).  

2. Navigate to **Applications** &gt; **Create App Integration**.  

3. Choose:  
   * **Sign-in method:** OIDC - OpenID Connect  
   * **Application type:** Web Application  

4. Fill in:  
   * **App name:** (e.g., `My Web App`)  
   * **Sign-in redirect URIs:** `http://localhost:3000/authorization-code/callback`  
   * **Sign-out redirect URIs:** `http://localhost:3000`  
   * **Assignments:** Select **Allow everyone** in your organization to access.  
   * After creating the app, click the edit button under Client Credentials and enable **Require PKCE as additional verification**.
   * Copy the **Client ID**, **Client Secret**, and your **Okta domain** (used for the issuer URL). You will need these for the `.env` file.  


### **Set Up Custom Claims** 

This project uses the `department` attribute from each user's Okta profile to manage access and filter expense data by team. Here's how to set it up.


#### **1\. Assign Departments to Users**

* In to your Okta Admin Console, navigate to **Directory \> People**

* Select a user, click **Profile**

* Set the `department` field to the user’s team (e.g., Finance, Marketing, Support, admin (for users with admin privileges))

* **Note:** Ensure you update the department for all user profiles associated with different teams in the auth.js and expenseData.js file. Also, replace the placeholder team names in the .env file with the actual team names that you want. 

#### **2\. Create a Custom Claim in the Authorization Server**

* In the Admin Console, go to **Security \> API \> Authorization Servers**

* Select your Authorization Server

* Go to the **Claims** tab and click **Add Claim**

* Configure the claim as follows:

  * **Name:** `department`
  * **Include in token type:** ID Token and Userinfo / id_token request  
  * **Value type:** Select Expression
  * **Value:** `user.department`
  * **Include in:** Select Any scope

### Run the Application

```
npm start
```

Open [http://localhost:3000](http://localhost:3000) in your browser and log in using your Okta credentials.

## Links

This example uses the following resources:

* [Passport](https://www.passportjs.org)
* [openid-client](https://www.passportjs.org/packages/openid-client)
* [RFC 7636: Proof Key for Code Exchange by OAuth Public Clients](https://www.rfc-editor.org/rfc/rfc7636)
* [Authorization Code Grant with PKCE](https://developer.okta.com/docs/guides/implement-grant-type/authcodepkce/main)


## Help

Please post any questions as comments on the [blog post][blog], or visit our [Okta Developer Forums](https://devforum.okta.com/).

## License

Apache 2.0, see [LICENSE](LICENSE).
