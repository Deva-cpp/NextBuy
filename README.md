# 🛒 NextBuy — MERN Stack E-Commerce Project

NextBuy is a full-stack e-commerce web application built using the MERN stack (MongoDB, Express, React, Node.js). This project allows users to browse products, sign up/login, manage cart and wishlist, and place orders. It features advanced bot protection mechanisms to prevent automated attacks, scraping, and abuse.

---

## 📁 Project Structure

```
nextbuy/
├── client/      # Frontend (React + Vite)
├── server/      # Backend (Node.js + Express)
├── docs/        # Project documentation
├── .env         # Environment variables for server
├── package.json # Root workspace manager
```

---

## 🚀 Getting Started

### 1. Install Dependencies

```bash
npm install
```

This installs `concurrently` in the root to run client and server together.

Then install inside both folders:

```bash
cd client && npm install
cd ../server && npm install
```

---

### 2. Create Environment Variables

#### Server `.env`

```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
```

> Replace `your_mongodb_connection_string` with your actual MongoDB URI from [MongoDB Atlas](https://www.mongodb.com/cloud/atlas).

#### Client API URLs

Product data is fetched from FakeStoreAPI:

- https://fakestoreapi.com/products
- https://fakestoreapi.com/products/:id

Auth requests go to your local server:

```js
await axios.post("http://localhost:5000/api/auth/login", form);
await axios.post("http://localhost:5000/api/auth/signup", form);
```

Update the base URL to environment variable if deploying.

---

### 3. Start the Project

From root:

```bash
npm run dev
```

This will start both the client and server using `concurrently`.

---

## 🧪 Features

- 🔐 User Authentication (Login, Signup)
- 🛍️ Product Listing (from FakeStore API)
- 💖 Wishlist and Cart (with Redux Toolkit)
- 🔒 Protected Routes
- 📦 Checkout UI (static)
- 🎨 Tailwind CSS for styling
- ⚙️ RESTful API for Auth using MongoDB
- 🤖 Advanced Bot Protection:
  - Behavioral Analysis
  - Rate Limiting
  - CAPTCHA Verification
  - Device Fingerprinting
  - Honeypot Traps
  - Headless Browser Detection
- 🧪 Comprehensive Security Testing Suite

---

## 🛠️ Tech Stack

### Frontend

- React 19
- React Router DOM 7
- Redux Toolkit + Redux Persist
- Tailwind CSS 4
- Axios
- FingerprintJS (for device fingerprinting)
- React Google reCAPTCHA

### Backend

- Express.js 5
- MongoDB + Mongoose
- bcrypt (password hashing)
- express-rate-limit (for rate limiting)
- helmet (for HTTP header security)
- express-mongo-sanitize (for NoSQL injection protection)
- hpp (for HTTP parameter pollution protection)

---

## 📄 Scripts

From root:

- `npm run dev` — Starts client and server together

From client folder:

- `npm run dev` — Starts Vite server
- `npm run build` — Builds production-ready frontend

From server folder:

- `npm run dev` — Starts Express server with nodemon
- `npm start` — Starts Express with native node

---

## 📚 Documentation

Additional documentation can be found in the `docs` directory:

- [Bot Protection](./docs/BOT_PROTECTION.md) - Details on the bot protection features
- [Testing Suite](./docs/TESTING.md) - Information about the security testing suite

---

## 👨‍💻 Authors

- **Devendra Kumar Dewangan** - *System Design & Full Stack Developer*
- **Somil Agrawal** - *Information Security Analyst & Database Administrator*
- **Abhishek Dixit** - *Data Science & Cybersecurity Engineer*

## 📧 Contact

For questions, support, or contributions, please contact us at:
**ankit2004dewangan@gmail.com**

---

## 📄 License

This project is licensed under the **ISC License**.
