# Restaurant Management Backend API

This repository contains the backend API for a Restaurant Management System. It handles various functionalities required for managing a restaurant's operations.

---

## Features

-   **User Authentication & Authorization (RBAC):** Secure user registration, login, and role-based access control (Admin, Staff, Customer).
-   **Menu Item Management:** CRUD operations for managing menu items.
-   **Order Management:** APIs for placing orders, tracking order statuses, and retrieving order history.
-   **Table Management:** Management of restaurant tables, including capacity and location.
-   **Reservation Management:** Comprehensive system for booking tables with availability and capacity checks.
-   **Inventory Management:** Tracking and managing restaurant inventory items.

---

## Technologies Used

-   **Node.js**
-   **Express.js** (Web Framework)
-   **MongoDB** (Database)
-   **Mongoose** (ODM for MongoDB)
-   **JWT (JSON Web Tokens)** for authentication
-   **Bcrypt.js** for password hashing
-   **Dotenv** for environment variables
-   **Express-Async-Handler** for simplifying async operations
-   **Moment.js** for date/time handling

---

## Setup and Installation

1.  **Clone the repository:**
    ```bash
    git clone [https://github.com/YOUR_GITHUB_USERNAME/restaurant-management-backend.git](hhttps://github.com/Aditichoubey-adi/CodeAlpha_restaurant-management-backend)
    cd restaurant-management-backend
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Create a `.env` file:**
    In the root directory, create a file named `.env` and add the following environment variables. Replace placeholders with your actual values:
    ```
    PORT=5000
    MONGO_URI=mongodb+srv://aditi524:ryS8NNZkLnVV6eM7@cluster0.x7qzlhf.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0
    JWT_SECRET=a_strong_secret_key_for_jwt
    JWT_EXPIRE=30d
    ```

4.  **Run the development server:**
    ```bash
    npm run dev
    ```
    The API will be running on `http://localhost:5000`.

---

## API Endpoints

(You can add a list of your main API endpoints here later, e.g.:)

-   `POST /api/auth/register` - User registration
-   `POST /api/auth/login` - User login
-   `GET /api/menuitems` - Get all menu items
-   `POST /api/orders` - Place a new order
-   `POST /api/reservations` - Create a new reservation
-   ...and so on for all implemented modules.

---

## Folder Structure
.
├── config/            # Database connection, environment setup
├── controllers/       # Business logic for API routes
├── middleware/        # Authentication and error handling middleware
├── models/            # Mongoose schemas for database
├── routes/            # API route definitions
├── .env.example       # Example environment variables
├── server.js          # Main application file
├── package.json
└── README.md
└── LICENSE            
---



## License

This project is licensed under the [MIT License](LICENSE).

---

## Contact

-   Aditi choubey / https://github.com/Aditichoubey-adi
