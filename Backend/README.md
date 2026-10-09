# Melodify — Music Application 🎵

> **Melodify — Your music, your mood.**
>
> Backend learning notes and implementation reference for the Melodify music application.

**Project:** Melodify  
**Project tagline:** A music application for discovering, uploading, and organizing music.  
**Author:** Harsh Mishra  
**Admin / Maintainer:** hiharshTech Team  
**Documentation status:** Learning and development reference

> **Documentation labels**
> - **[changed by admin]** — Corrected or clarified an inaccurate or misleading statement from the original notes.
> - **[added by admin]** — Additional information added to improve understanding, security, or repository quality.

---

## Table of Contents

1. [Project Overview](#project-overview)
2. [Initialize the Node.js Project](#1-initialize-the-nodejs-project)
3. [MongoDB `$or` Operator](#2-mongodb-or-operator)
4. [Password Hashing with bcryptjs](#3-password-hashing-with-bcryptjs)
5. [File Uploads with Multer](#4-file-uploads-with-multer)
6. [Middleware in Express.js](#5-middleware-in-expressjs)
7. [How the Melodify Upload Flow Works](#6-how-the-melodify-upload-flow-works)
8. [Quick Interview Revision](#7-quick-interview-revision)
9. [Recommended Repository Structure](#8-recommended-repository-structure)
10. [Security and Development Checklist](#9-security-and-development-checklist)
11. [License](#license)
12. [Author and Maintainer](#author-and-maintainer)

---

## Project Overview

Melodify is a music application backend built with Node.js, Express.js, and MongoDB. The backend can support user authentication, music uploads, and album creation.

These notes explain selected backend concepts used in the project. They are intended for learning and development and should be kept aligned with the actual source code.

### Core technologies

| Technology | Purpose |
|---|---|
| Node.js | Runs JavaScript on the server |
| Express.js | Defines routes and handles HTTP requests and responses |
| MongoDB | Stores application data |
| Mongoose | Defines schemas and works with MongoDB documents |
| dotenv | Loads environment variables from a `.env` file |
| cookie-parser | Makes request cookies available through `req.cookies` |
| jsonwebtoken | Creates and verifies JSON Web Tokens (JWTs) |
| bcryptjs | Hashes passwords and verifies password matches |
| Multer | Processes multipart file uploads in Express |
| ImageKit SDK | Uploads and manages files using ImageKit, when configured |

> **[added by admin]** Install `multer`, `bcryptjs`, and the ImageKit SDK only if the application uses them. The ImageKit SDK package name and initialization code depend on the SDK version used by the project.

---

## 1. Initialize the Node.js Project

Run these commands in the terminal:

```bash
npm init -y
npm install express dotenv cookie-parser jsonwebtoken mongoose
```

Install additional packages used by the project:

```bash
npm install bcryptjs multer
```

> **[added by admin]** Install the correct ImageKit SDK package separately if your storage service uses it. Follow the documentation for the SDK version selected by the project.

### What do these packages do?

- **Express:** Helps create the server, routes, and request handlers.
- **dotenv:** Loads environment variables from `.env`.
- **cookie-parser:** Parses cookies sent by the client.
- **jsonwebtoken:** Creates and verifies JWTs.
- **mongoose:** Defines schemas and communicates with MongoDB.
- **bcryptjs:** Hashes passwords and checks passwords against stored hashes.
- **multer:** Processes file uploads sent as `multipart/form-data`.

### Environment variables

A `.env` file may contain settings such as:

```env
PORT=3000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=replace_with_a_long_random_secret
```

> **[added by admin]** These are example variable names. Make sure they match the names used in your application. Never commit real database credentials, API keys, or JWT secrets to a public repository.

Add a `.gitignore` file at the repository root:

```gitignore
node_modules/
.env
.env.*
!.env.example
coverage/
dist/
build/
npm-debug.log*
.DS_Store
```

> **[added by admin]** Keep `.env.example` free of real secrets. It should document required variable names with placeholder values only.

---

## 2. MongoDB `$or` Operator

### What is `$or`?

MongoDB's `$or` operator matches documents when **at least one** of the specified conditions is true.

It accepts an array of query-condition objects.

Example:

```javascript
{
    $or: [
        { username: "harsh" },
        { email: "harsh@example.com" }
    ]
}
```

This query matches a user whose username is `harsh` **or** whose email is `harsh@example.com`.

### Why do we use `$or`?

During registration, we may want to check whether a username or email address is already in use.

Suppose the database contains these users:

- **User 1:** Username `a`, email `a@example.com`
- **User 2:** Username `b`, email `b@example.com`

A new registration request contains:

```javascript
{
    username: "a",
    email: "b@example.com"
}
```

### Without `$or`

```javascript
const user = await userModel.findOne({
    username: "a",
    email: "b@example.com"
});
```

**[changed by admin]** When multiple fields are included in the same MongoDB query object, MongoDB treats them as an **AND** condition. It looks for one document that matches both conditions.

Because the username and email belong to different documents, this query returns `null`.

### With `$or`

```javascript
const user = await userModel.findOne({
    $or: [
        { username: "a" },
        { email: "b@example.com" }
    ]
});
```

This query matches either user. However, `findOne()` returns **only one** matching document, not both. If the application needs all matching documents, use `find()`.

> **[changed by admin]** Do not rely on `findOne()` to tell you which of several fields caused a conflict. It returns one matching document, and the returned document is not guaranteed to identify every conflict.

### Registration example

```javascript
const existingUser = await userModel.findOne({
    $or: [
        { username },
        { email }
    ]
});

if (existingUser) {
    return res.status(409).json({
        message: "Username or email already exists."
    });
}
```

This checks whether either the username or email is already registered.

> **[added by admin]** For a more precise message, check username and email separately, or inspect the returned document. Also add unique indexes to the relevant schema fields to protect against duplicate registrations caused by simultaneous requests. Application-level checks alone do not guarantee uniqueness.

Example schema fields:

```javascript
username: {
    type: String,
    required: true,
    unique: true,
    trim: true
},
email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
}
```

> **[added by admin]** MongoDB unique indexes enforce uniqueness at the database level. Existing duplicate data can prevent index creation, so check and clean the data before adding them. Handle duplicate-key errors in the controller.

---

## 3. Password Hashing with bcryptjs

### What is hashing?

Hashing transforms input data into a value called a hash. Password hashing uses a deliberately expensive algorithm to make guessing passwords more difficult.

In backend applications, passwords should not be stored as plain text.

### Why is password hashing important?

Storing a plain-text password is dangerous. If someone gains unauthorized access to the database, they could read the passwords directly.

Instead, store a password hash.

```text
Example only:

Original password: [user's password]
Stored value:      [bcrypt hash]
```

> **[changed by admin]** A password hash is not the same as encryption. Encryption is designed to be reversible with a suitable key; password hashing is designed so that recovering the original password from the hash is computationally difficult. A hash does not guarantee that a weak password cannot be guessed.

### How does password hashing work?

1. The user submits a password.
2. The backend validates the request.
3. The backend hashes the password using bcrypt.
4. The backend stores the hash in the database.
5. During login, bcrypt compares the submitted password with the stored hash.
6. If they match, authentication can continue.

### Install bcryptjs

```bash
npm install bcryptjs
```

### Hash a password

```javascript
const bcrypt = require("bcryptjs");

const hash = await bcrypt.hash(password, 10);
```

- `password` is the password submitted by the user.
- `bcrypt.hash()` creates a bcrypt hash.
- `10` is the bcrypt cost factor, often called the number of salt rounds.

### What is a salt?

A salt is a random value used when generating a password hash. It helps ensure that identical passwords normally produce different hashes.

> **[changed by admin]** bcrypt includes the salt and cost information in its encoded hash string, so the application normally stores the returned hash as one value rather than storing a separate salt field.

### What does `10` mean?

The value `10` sets bcrypt's cost factor. Increasing it generally makes password hashing slower and makes large-scale password guessing more expensive.

> **[changed by admin]** A cost factor of `10` does **not** mean an attacker is delayed for 10 seconds, 10 years, or any fixed period. A very large cost factor can make your own application too slow. Select a suitable value based on current security guidance and benchmark it on your deployment hardware.

### Compare a password during login

```javascript
const isPasswordValid = await bcrypt.compare(
    password,
    user.password
);
```

- `password` is the password submitted at login.
- `user.password` is the stored bcrypt hash.
- `bcrypt.compare()` returns `true` if the submitted password matches the hash; otherwise, it returns `false`.

> **[changed by admin]** `bcrypt.compare()` does not need you to generate and manually compare a new hash. It reads the salt and cost parameters from the stored hash and performs the verification.

### Example login check

```javascript
const isPasswordValid = await bcrypt.compare(
    password,
    user.password
);

if (!isPasswordValid) {
    return res.status(401).json({
        message: "Invalid email or password."
    });
}
```

> **[added by admin]** Use a generic login error such as “Invalid email or password” to avoid revealing whether an account exists. Never log passwords or return password hashes in API responses. Validate input and consider rate limiting authentication endpoints.

---

## 4. File Uploads with Multer

### What is Multer?

Multer is Express middleware that processes files submitted using `multipart/form-data`. It is commonly used for file uploads.

Install it:

```bash
npm install multer
```

### How does Multer work in Melodify?

In a music application, the upload process can work like this:

1. The user selects a music file on the frontend.
2. The frontend sends the file as `multipart/form-data`.
3. Multer processes the uploaded file.
4. With `memoryStorage()`, the file is held in server memory.
5. The file data is available through `req.file.buffer` for a single-file upload.
6. The backend uploads the file to the configured storage provider, such as ImageKit.
7. The storage provider returns a file URL or another file identifier.
8. The backend stores the required metadata in MongoDB.

> **[added by admin]** The steps above describe a typical flow. Confirm that the actual Melodify storage service uses the same provider and response format.

### Configure memory storage

```javascript
const multer = require("multer");

const storage = multer.memoryStorage();

const upload = multer({
    storage,
    limits: {
        fileSize: 10 * 1024 * 1024 // 10 MB example limit
    }
});

module.exports = upload;
```

> **[added by admin]** The 10 MB limit is an example, not a recommended universal limit for music files. Set a limit appropriate for your app's file types and expected song sizes. Also validate file type and content on the server; do not trust the filename or client-provided MIME type alone.

For a single-file route:

```javascript
router.post(
    "/upload",
    upload.single("file"),
    createMusic
);
```

The frontend form field name must match `"file"`.

For example, the file is available as:

```javascript
req.file
```

Its in-memory contents are available as:

```javascript
req.file.buffer
```

> **[changed by admin]** `req.file` is available when the request includes a valid file under the field name expected by Multer. If no file is uploaded, `req.file` may be `undefined`. Check it before accessing `req.file.buffer`.

### Upload safety checklist

- Set an appropriate file-size limit.
- Allow only supported file types.
- Validate the uploaded content on the server.
- Avoid logging file contents or secrets.
- Handle storage-provider failures.
- Consider memory usage under concurrent uploads.
- Keep storage-provider credentials in environment variables.

---

## 5. Middleware in Express.js

### What is middleware?

Middleware is a function that runs during the Express request-response cycle. It can inspect or modify the request, send a response, pass control to the next handler, or pass an error to error-handling middleware.

A common project structure is:

```text
src/
├── controllers/
│   └── auth.controller.js
├── middlewares/
│   └── auth.middleware.js
├── routes/
│   └── music.routes.js
└── models/
```

### Why do we use middleware?

Suppose multiple routes require a valid JWT. Writing the same token-verification code in every controller repeats logic.

Instead, we can create reusable authentication middleware and attach it to protected routes. This makes the application easier to maintain.

### The three common middleware parameters

```javascript
(req, res, next)
```

#### 1. `req` — Request

The request object contains information about the incoming HTTP request, including:

- `req.body` — Parsed request body, when the relevant body-parsing middleware is configured.
- `req.params` — Route parameters.
- `req.query` — Query-string parameters.
- `req.cookies` — Parsed cookies, when `cookie-parser` is configured.
- `req.headers` — Request headers.
- `req.file` — A single uploaded file processed by Multer.
- `req.files` — Uploaded files in Multer configurations that process multiple files.

#### 2. `res` — Response

The response object is used to send a response to the client.

```javascript
res.status(200).json({
    message: "Request successful"
});
```

This sends a JSON response with HTTP status `200`.

#### 3. `next` — Next function

`next()` passes control to the next middleware or route handler.

```javascript
function exampleMiddleware(req, res, next) {
    console.log("Middleware executed");
    next();
}
```

> **[changed by admin]** If middleware neither sends a response nor calls `next()` (or otherwise completes the response), the request may remain pending. To pass an error to Express error-handling middleware, use `next(error)`.

### Example: JWT authentication middleware

Create `src/middlewares/auth.middleware.js`:

```javascript
const jwt = require("jsonwebtoken");

function authMiddleware(req, res, next) {
    const token = req.cookies?.Token;

    if (!token) {
        return res.status(401).json({
            message: "Unauthorized: Token is missing"
        });
    }

    try {
        const decoded = jwt.verify(
            token,
            process.env.JWT_SECRET
        );

        req.user = decoded;
        return next();
    } catch (error) {
        return res.status(401).json({
            message: "Invalid or expired token"
        });
    }
}

module.exports = authMiddleware;
```

### How does this middleware work?

1. It looks for a token in the `Token` cookie.
2. If the cookie is missing, it returns `401 Unauthorized`.
3. If a token exists, `jwt.verify()` checks its signature and expiration, when present.
4. If verification succeeds, the decoded token payload is assigned to `req.user`.
5. `next()` passes control to the next handler.
6. If verification fails, the middleware returns an unauthorized response.

> **[added by admin]** This middleware assumes `cookie-parser` has already been registered with `app.use(cookieParser())` and that `JWT_SECRET` is configured. Make sure the cookie name and JWT payload match the rest of your application.

### Use middleware in routes

Example for `src/routes/music.routes.js`:

```javascript
const express = require("express");
const router = express.Router();

const authMiddleware = require("../middlewares/auth.middleware");
const upload = require("../middlewares/upload.middleware");

const {
    createMusic,
    createAlbum
} = require("../controllers/music.controller");

router.post(
    "/upload",
    authMiddleware,
    upload.single("file"),
    createMusic
);

router.post(
    "/album",
    authMiddleware,
    createAlbum
);

module.exports = router;
```

> **[added by admin]** This example assumes the Multer configuration is exported from `upload.middleware.js`. Adjust the import path to match your project. Middleware order matters: authentication runs before the upload handler here, so unauthenticated users do not need to upload the file before being rejected.

### Avoid duplicate token verification

If the route already uses `authMiddleware`, the controller can use the verified identity stored in `req.user` rather than verifying the same token again.

For example:

```javascript
const artistId = req.user.id;
```

> **[changed by admin]** Use the actual property name in your JWT payload. It might be `id`, `_id`, or `userId`, depending on how the token was created. Also check authorization separately: a valid token alone does not mean the user has the artist role or permission to perform every action.

---

## 6. How the Melodify Upload Flow Works

A typical authenticated music-upload flow:

```text
Frontend
   |
   | POST /upload (cookie + multipart/form-data)
   v
Express Router
   |
   v
Authentication Middleware
   |
   v
Multer Middleware
   |
   v
Music Controller
   |
   v
Storage Service (e.g., ImageKit)
   |
   v
MongoDB via Mongoose
   |
   v
JSON Response to Frontend
```

> **[added by admin]** The exact sequence depends on the route configuration. If authentication is placed before Multer, authentication is checked before the upload is processed. The storage provider stores the actual media file, while MongoDB generally stores metadata such as the title, artist ID, and file URL or storage identifier.

### Suggested API behavior

- Return `201 Created` when a music track or album is created successfully.
- Return `400 Bad Request` when required fields or input formats are invalid.
- Return `401 Unauthorized` when authentication is missing or invalid.
- Return `403 Forbidden` when an authenticated user lacks permission.
- Return `409 Conflict` for uniqueness conflicts, such as a duplicate username or email.
- Return `500 Internal Server Error` for unexpected server failures without exposing sensitive details.

> **[added by admin]** These status codes are general conventions. Use responses consistently throughout the actual API and log enough server-side detail to debug unexpected failures without exposing secrets to clients.

---

## 7. Quick Interview Revision

| Topic | Simple explanation |
|---|---|
| `$or` | Matches documents when at least one specified condition is true. |
| `findOne()` | Returns one matching document or `null`. |
| `find()` | Returns all matching documents in a query result. |
| Hashing | Converts input into a hash; password hashing makes password guessing more expensive. |
| bcryptjs | A library for hashing passwords and verifying password matches. |
| Salt | A random value used when generating a password hash. |
| Cost factor | Controls the computational expense of bcrypt hashing. |
| `bcrypt.hash()` | Generates a bcrypt password hash. |
| `bcrypt.compare()` | Checks whether a password matches a stored bcrypt hash. |
| Multer | Processes file uploads in Express. |
| `memoryStorage()` | Keeps uploaded file data in server memory. |
| `req.file` | Contains metadata and buffer for a single uploaded file. |
| Middleware | A function that runs during the request-response cycle. |
| `req` | Contains incoming request information. |
| `res` | Sends a response to the client. |
| `next()` | Passes control to the next handler. |
| JWT middleware | Verifies a token before allowing a request to continue. |
| Authentication | Checks who the user is. |
| Authorization | Checks what the user is allowed to do. |

---

## 8. Recommended Repository Structure

A professional repository may contain files like these. Keep only the files that are relevant to the actual project.

```text
Melodify/
├── src/
│   ├── controllers/
│   ├── middlewares/
│   ├── models/
│   ├── routes/
│   ├── services/
│   ├── utils/
│   └── app.js
├── .env.example
├── .gitignore
├── LICENSE
├── package.json
├── package-lock.json
└── README.md
```

> **[added by admin]** This is a suggested structure, not a requirement to move existing files. Avoid reorganizing working code unless you also update its import paths and tests.

### Suggested `package.json` scripts

Check your existing scripts before changing them. A common setup is:

```json
{
  "scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js"
  }
}
```

If `nodemon` is not installed, install it as a development dependency:

```bash
npm install --save-dev nodemon
```

> **[added by admin]** Preserve the scripts and entry point that your project actually uses. If `server.js` is inside `src`, update the script accordingly.

---

## 9. Security and Development Checklist

Before publishing or deploying Melodify, review the following:

- [ ] Never commit `.env` or real credentials.
- [ ] Provide a safe `.env.example`.
- [ ] Hash passwords before saving them.
- [ ] Never return passwords or password hashes in API responses.
- [ ] Validate user input on the server.
- [ ] Handle duplicate-key database errors.
- [ ] Validate file uploads and limit their size.
- [ ] Restrict protected routes with authentication and authorization checks.
- [ ] Use HTTPS in production.
- [ ] Configure cookie flags appropriately for the deployment (`httpOnly`, `secure`, and `sameSite` as applicable).
- [ ] Consider rate limiting login and registration endpoints.
- [ ] Avoid sending stack traces or secrets to clients.
- [ ] Add tests for successful requests and failure cases.
- [ ] Keep dependencies updated and review security advisories.
- [ ] Document setup, environment variables, API routes, and common development commands.

> **[added by admin]** Cookie settings, CORS, and CSRF protections depend on how the frontend and backend are deployed. Review them together rather than copying one configuration blindly.

---

## License

**[added by admin]** Choose a license that matches how you want others to use the project. The following is an MIT License notice template. Use it only if you decide to release Melodify under the MIT License and have the right to do so. Replace `[YEAR]` with the appropriate year and confirm the author or copyright holder before publishing.

```text
MIT License

Copyright (c) [YEAR] Harsh Mishra

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
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
```

> **[added by admin]** Do not describe the project as MIT-licensed until the license has been selected and the `LICENSE` file has been added to the repository. A license does not automatically grant rights to third-party music, images, logos, or other assets.

---

## Author and Maintainer

**Project:** Melodify  
**Tagline:** Your music, your mood.  
**Description:** A music application for discovering, uploading, and organizing music.  
**Author:** Harsh Mishra  
**Admin / Maintainer:** hiharshTech Team

---

*Documentation maintained for the Melodify project. Keep examples, package versions, environment variables, routes, and license details synchronized with the actual repository.*
