## Expense Dashboard Built with Express, Okta and Passport

This project shows how to build a secure team-scoped expense dashboard with a secure login system. Users see expenses only for their team, making it easy to track spending without hassle.

## Features

* OpenID Connect(OIDC) App, built with Express and Passport for flexible and secure authentication 
* Authorization Code Flow with PKCE, which is the most secure flow for server-side web apps 
* Passwordless login support with FIDO2 (WebAuthn)   
* Custom claim-based team expense dashboard


## Prerequisites

* Node.js installed (v22+ recommended)

* [Okta Integrator Free Plan org](https://developer.okta.com/signup/)

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

2. Navigate to **Applications** &gt; **Create App Integration**.  

3. Choose:  
   * **Sign-in method:** OIDC - OpenID Connect  
   * **Application type:** Web Application  

4. Fill in:  
   * **App name:** (e.g., `My Express App`)  
   * **Sign-in redirect URIs:** `http://localhost:3000/authorization-code/callback`  
   * **Sign-out redirect URIs:** [`http://localhost:3000`](http://localhost:3000)  
   * **Assignments:** Select Allow everyone in your organization to access.  

   * After creating the app, click the edit button under Client Credentials and enable Require PKCE as additional verification.

   * Copy the Client ID, Client Secret, and your Okta domain (used for the issuer URL). You will need these for the `.env` file.  

   * Configure an [access policy](https://developer.okta.com/docs/guides/configure-access-policy/main)




### **Set Up Custom Claims for Department Information:** 

This project uses a custom user attribute (`department`) in Okta to scope access and filter expense data by team. Here’s how to set it up:

#### **1\. Create a Custom User Profile Attribute**

* In to your Okta Admin Console navigate to **Directory \> Profile Editor**

* Select the user profile (e.g., **My Web App**) and click **Add Attribute**

* Create an attribute with:

  * Display name: Department

  * Variable name: department

  * Data type: string

#### **2\. Map the Custom Attribute to Your Application**

* Next, in the **Profile Editor**, under the Attributes section, click **Mappings**. Select Okta User to [Your App Name]

* Find the department attribute you just created. In the input field next to it, enter `user.department`. Click the arrow dropdown, select **"Apply mapping on user create and update,"** and then click **Save Mappings**.

#### **3\. Assign Departments to Users**

* Go to **Directory \> People**

* Select a user, click **Profile**

* Set the `department` field to the user’s team (e.g., `Finance`, `Marketing`, `Support`, `all` (for admin))

* **Note:** Ensure you update the department for all user profiles associated with different teams. Also, replace the placeholder team names in the .env file with the actual team names that you want. 

#### **4\. Create a Custom Claim in the Authorization Server**

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
npm start
```

Open [http://localhost:3000](http://localhost:3000) in your browser and log in using your Okta credentials.
