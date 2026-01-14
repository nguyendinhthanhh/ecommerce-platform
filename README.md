# E-Commerce Platform

## 1. Project Overview

This project is an **E-Commerce Web Platform** developed as a **group assignment for the SWD392 course**.  
The system provides a complete online shopping experience, including product browsing, shopping cart, online payment, order tracking, product reviews, and AI-assisted features.

The platform supports multiple roles such as **Customer**, **Seller**, and **Admin**, and follows a modern **frontend–backend separated architecture** with Continuous Integration (CI).

---

## 2. Team Members

| No. | Full Name         | Student ID | Email                      |
| --: | ----------------- | ---------- | -------------------------- |
|   1 | Phan Văn Huy      | SE184969   | huypvse184969@fpt.edu.vn   |
|   2 | Trần Quốc Công    | SE180709   | congtqse180709@fpt.edu.vn  |
|   3 | Trần Nhật Huy     | SE180369   | huytnse180369@fpt.edu.vn   |
|   4 | Dương Xuân Sơn    | SE181792   | sondxse181792@fpt.edu.vn   |
|   5 | Nguyễn Trung Tín  | SE181711   | tinnntse181711@fpt.edu.vn  |
|   6 | Nguyễn Đình Thanh | SE182854   | thanhndse182854@fpt.edu.vn |

---

## 3. Project Objectives

The main objectives of this project are:

- Design and implement a modern e-commerce web application
- Apply software engineering principles such as UML use case modeling
- Separate frontend and backend for better scalability and maintainability
- Integrate supporting systems such as online payment and AI services
- Practice teamwork, Git workflow, and Continuous Integration (CI)

---

## 4. System Features

### 4.1 Customer Features

- Browse and search products
- View product details and AI-based recommendations
- Manage shopping cart
- Place orders
- Make online payments (VNPay / Momo – simulated)
- Track order status
- Rate and review products
- Receive customer support via AI chatbot

### 4.2 Seller Features

- Manage shop information
- Manage products (AI-assisted product classification)
- Manage orders and update order status
- View sales reports

### 4.3 Admin Features

- Manage user accounts
- Moderate product content and customer reviews
- View system reports and statistics

---

## 5. System Architecture

The system follows a **monorepo architecture** with separated frontend and backend:

```
ecommerce-platform/
├── backend/        # Spring Boot backend
├── frontend/       # React frontend
├── docs/           # UML diagrams and documentation
├── .github/        # CI configuration
└── README.md
```

Architecture Overview

Frontend: Handles user interface and user interactions

Backend: Handles business logic, authentication, and data persistence

AI System: Internal supporting system for product classification, recommendation, and chatbot

Payment Gateway: Supporting system for processing online payments (simulated)

6. Technology Stack
   Backend

Java 21

Spring Boot 4.x

Spring Data JPA

Spring Security (JWT Authentication)

SQL Server / MySQL

Maven

Frontend

React

React Router

Axios

Vite

Modern UI libraries (MUI / Ant Design / Tailwind CSS)

AI & Payment (Supporting Systems)

AI features implemented as internal services or mocked logic

Online payment simulated for VNPay / Momo integration

DevOps

Git & GitHub

GitHub Actions (Continuous Integration)

7. Use Case Summary

The system is designed based on high-level UML use cases.

Actors

Customer

Seller

Admin

Main Use Cases

Browse Products

Manage Shopping Cart

Place Order

Make Online Payment

Track Order

Rate and Review Products

Manage Products

Manage Orders

Moderate Content

View System Reports

AI System and Payment Gateway are modeled as supporting systems, not external actors.

8. Order Status Flow

The order tracking feature follows this status flow:

Order Placed
↓
Order Confirmed
↓
Shipped
↓
Delivered

Order status is updated by the system or seller

Customers can track the current order status at any time

9. Continuous Integration (CI)

This project uses GitHub Actions for Continuous Integration:

Automatically builds backend and frontend on each push or pull request

Ensures build consistency across environments

Helps detect errors early during development

CI configuration file:

.github/workflows/ci.yml

10. How to Run the Project
    10.1 Backend
    cd backend
    mvn clean install
    mvn spring-boot:run

Backend will be available at:

http://localhost:8080

10.2 Frontend
cd frontend
npm install
npm run dev
