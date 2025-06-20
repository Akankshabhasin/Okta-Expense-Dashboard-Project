## Expense Dashboard Built with Express.js, Okta and Passport.js

This project shows how to build a secure team-scoped expense dashboard with a secure login system. Users see expenses only for their team, making it easy to track spending without hassle.

## Features

* Single Sign-On via Okta with OpenID Connect, built using Passport.js for flexible and secure authentication.  
* Passwordless login support with FIDO2 (WebAuthn)   
* Role-based access control using custom claims  

## Prerequisites

* Node.js installed (v22+ recommended)

## Getting Started

**1\. Clone the repository**

```
git clone https://github.com/your-username/Okta-Expense-Dashboard-Project.git
cd Okta-Expense-Dashboard-Project
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
ALL_TEAMS_NAME=TeamName1,TeamName2,Team Name3
```

**4\. Create an OIDC Application in Okta**

  1. Sign up for a free [Integrator Free Plan](https://developer.okta.com/signup/). If you already have an account, directly [login](https://developer.okta.com/login/) to the [Okta Developer Console](https://developer.okta.com/signup/).   
  2. Navigate to **Applications** \> **Create App Integration**.  
  3. Choose:  
    1. **Sign-in method:** OIDC \- OpenID Connect  
    2. **Application type:** Web Application  
  4. Fill in:  
    1. **App name:** (e.g., `My Express App`)  
    2. **Sign-in redirect URIs:** `http://localhost:3000/authorization-code/callback`  
    3. **Sign-out redirect URIs:** [`http://localhost:3000`](http://localhost:3000)  
    5. Configure an [access policy](https://developer.okta.com/docs/guides/configure-access-policy/main/)

### **Set Up Custom Claims for Department Information:** /suggested new or maybe mention

This project uses a custom user attribute (`department`) in Okta to scope access and filter expense data by team. Here’s how to set it up:

#### **1\. Create a Custom User Profile Attribute**

* In to your Okta Admin Console navigate to **Directory \> Profile Editor**

* Select the user profile (e.g., **My Web App**) and click **Add Attribute**

* Create an attribute with:

  * Display name: Department

  * Variable name: department

  * Data type: string

#### **2\. Assign Departments to Users**

* Go to **Directory \> People**

* Select a user, click **Profile**

* Set the `department` field to the user’s team (e.g., `Finance`, `Marketing`, `Customer Success`, `all` (for admin))

#### **3\. Create a Custom Claim in the Authorization Server**

* In the Admin Console, go to **Security \> API \> Authorization Servers**

* Select your Authorization Server (usually `default`)

* Go to the **Claims** tab and click **Add Claim**

* Configure the claim as follows:

  * **Name:** department

  * **Include in token type:** ID Token (and optionally Access Token)

  * **Value type:** `Expression`

  * **Value:** `user.department` (this pulls from the Okta’s user profile attribute)

  * **Include in:** Always (or based on scopes if you want to limit)

### Run the Application

```
node index.js
```

Open [http://localhost:3000](http://localhost:3000) in your browser and log in using your Okta credentials.