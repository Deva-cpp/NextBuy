# 🖥️ NextBuy Server

This is the backend server for the **NextBuy** e-commerce application. Built with **Node.js**, **Express**, and **MongoDB**, it handles user authentication, data routing, and implements robust bot protection mechanisms.

---

## 🚀 Features

- User Signup & Login (with hashed passwords using `bcrypt`)
- MongoDB integration using `mongoose`
- RESTful API routes under `/api/auth`
- Comprehensive Bot Protection System:
  - Rate limiting with express-rate-limit
  - IP address analysis and filtering
  - Headless browser detection
  - Device fingerprinting verification
  - Behavioral analysis and scoring
  - SQL injection protection
  - MongoDB injection protection
- Admin dashboard for bot metrics
- Security-focused middleware:
  - helmet for HTTP headers security
  - express-mongo-sanitize for NoSQL injection protection
  - hpp for HTTP Parameter Pollution protection

---

## 📦 Technologies Used

- **Node.js** – Runtime
- **Express.js 5** – Web framework
- **MongoDB** – NoSQL Database
- **Mongoose** – ODM for MongoDB
- **dotenv** – Environment variable management
- **cors** – Cross-Origin Resource Sharing
- **nodemon** – Auto-restarts the server on file changes (in development)
- **helmet** – HTTP header security
- **express-rate-limit** – API rate limiting
- **express-mongo-sanitize** – NoSQL injection protection
- **hpp** – HTTP Parameter Pollution protection
- **multer** – File upload handling
- **ua-parser-js** – User agent parsing

---

## 📁 Folder Structure

```
server/
├── routes/               # API route handlers
│   ├── authRoutes.js
│   ├── productRoutes.js
│   ├── botProtectionRoutes.js
│   ├── admin.js
│   └── benchmarkRoutes.js
├── middleware/           # Express middleware
│   ├── auth.js
│   └── botProtection.js
├── User/                 # User models
│   ├── User.js
│   └── BotDetection.js
├── utils/                # Utility functions
│   └── botMetricsMonitor.js
├── docs/                 # Documentation
│   └── BOT_PROTECTION_TESTING.md
├── tests/                # Security testing suite
├── uploads/              # File uploads directory
├── .env                  # Environment variables
├── .gitignore
├── package.json
└── server.js
```

---

## 🛠️ Setup & Run

### 1. Install dependencies

```bash
cd server
npm install
```

### 2. Create a `.env` file

```
PORT=5000
MONGO_URI=your_mongodb_connection_string
```

> Make sure your MongoDB URI is from [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) and your current IP is whitelisted.

### 3. Run the server

```bash
# Start with nodemon (dev mode)
npm run dev

# OR start normally
npm start
```

Server will run on: `http://localhost:5000`

---

## 📬 API Endpoints

| Method | Endpoint                     | Description                    |
| ------ | ---------------------------- | ------------------------------ |
| POST   | `/api/auth/signup`           | Register a new user            |
| POST   | `/api/auth/login`            | Login a user                   |
| GET    | `/api/products`              | Get all products               |
| GET    | `/api/products/:id`          | Get a specific product         |
| GET    | `/api/admin/bot-dashboard`   | Bot detection dashboard        |
| GET    | `/api/admin/bot-metrics`     | Get bot detection metrics      |
| POST   | `/api/bot-protection/verify` | Verify CAPTCHA                 |

---

## 🧪 Testing

The server includes a comprehensive security testing suite in the `tests/` directory:

- **cURL Tests** - Basic HTTP request automation
- **Postman Collection** - API request automation
- **OWASP ZAP Tests** - Penetration testing
- **Apache Benchmark Tests** - Load testing
- **SlowHTTPTest** - Slow-rate DoS attack simulation
- **Python + Requests Tests** - Custom HTTP attack scripts
- **Locust Tests** - Scalable load testing

See [TEST_SUITE_README.md](./tests/TEST_SUITE_README.md) for detailed testing instructions.

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
