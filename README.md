# PA1414 MoveOut

## Introduction

This webapp will help you as a user to organize and keep track of your boxes when moving. Add your items as a list, image or audio file. Print out the label with a QR-code.

![pa1414screenshot](https://github.com/user-attachments/assets/1172a277-9fe4-47aa-b0d7-0833e816c051)

## How to Use

### Prerequisites

- [Node.js](https://nodejs.org/) (v14 or higher)
- [npm](https://www.npmjs.com/) (Node package manager) or [pnpm](https://pnpm.io/)

### Build

#### 1. Clone the repo

```bash
git clone https://github.com/alwwen/pa1414.git
cd pa1414
```

#### 2. Setup dependencies:

NPM:
```bash
cd frontend
npm install
```
```bash
cd backend
npm install
```
PNPM:
```bash
cd backend
pnpm install
```
```bash
cd backend
pnpm install
```

#### 3. Create and setup the .env file.

Go to the backend folder and create the .env file.

With empty values this is how it should look like:
```bash
JWT_SECRET=
CLIENT_ID=
ISSUER_BASE_URL=
SECRET=
GOOGLE_MAIL=
GOOGLE_MAIL_APP_PASS=

```

##### JWT
For the jwt secret create a random string of letters and numbers atleast 32 characters long.

##### Auth0
Client id is for your auth0 connection. Create an account here [Auth0](https://auth0.com/signup?place=header&type=button&text=sign%20up) and create a regular web application and dont forget to select using google-oauth2 connection during setup. Go to application on the left when you are done and press your newly created app. Settings should come up then. Copy the Client ID to CLIENT_ID and the Domain to ISSUER_BASE_URL. For SECRET copy the Client Secret on the same page. Then go to Credentials just to the right of Settings and select None for the Authentication Method as that was a bug when I installed it to not make it work unless this is selected. You will get another design on your google login but use only the login with google button.

##### Google Mail
If you have a google account you dont care about use that otherwise create a new one that is for this project. Setup 2FA on the account. Then head to [App_Passwords](https://myaccount.google.com/apppasswords) and log in. Create a new app password and save it without the spaces to GOOGLE_MAIL_APP_PASS. Save the email adress to GOOGLE_MAIL.

### Run

##### Server
Go to pa1414 folder
```bash
cd backend
node server.js
```

##### Client
Go to pa1414 folder

NPM:
```bash
cd frontend
npm run dev
```

PNPM:
```bash
cd frontend
pnpm dev
```

Then go to localhost:3000 and it should work.

## License

MIT License

Copyright (c) 2024 Alexander Winblad

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
