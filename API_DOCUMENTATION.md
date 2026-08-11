# API Documentation

This document provides a concise overview of the REST API endpoints available in the backend system.

## Base URL
All API routes are prefixed with `/` as defined in the `app.ts` file, and typically run on `http://localhost:3001` locally.
Example: `http://localhost:3001/auth/login`

## Authentication (`/auth`)

| Method | Endpoint | Description | Roles |
| :--- | :--- | :--- | :--- |
| **POST** | `/auth/login` | Authenticate user and receive an access token. | Public |
| **GET** | `/auth/me` | Fetch the currently authenticated user's profile. | Authenticated |

## Customers (`/customers`)

| Method | Endpoint | Description | Roles |
| :--- | :--- | :--- | :--- |
| **GET** | `/customers` | List all customers with pagination and filtering. | Admin, Sales, Accounts |
| **POST** | `/customers` | Create a new customer record. | Admin, Sales |
| **GET** | `/customers/:id` | Get details of a specific customer by ID. | Admin, Sales, Accounts |
| **PUT** | `/customers/:id` | Update an existing customer's details. | Admin, Sales |
| **POST** | `/customers/:id/follow-ups` | Add a follow-up note/interaction for a customer. | Admin, Sales |

## Products (`/products`)

| Method | Endpoint | Description | Roles |
| :--- | :--- | :--- | :--- |
| **GET** | `/products` | List all products (inventory items). | Authenticated |
| **GET** | `/products/categories` | Get a list of available product categories. | Authenticated |
| **POST** | `/products` | Create a new product. | Admin, Warehouse |
| **GET** | `/products/:id` | Get detailed information for a specific product. | Authenticated |
| **PUT** | `/products/:id` | Update a product's details. | Admin, Warehouse |
| **GET** | `/products/:id/stock-movements` | Retrieve the stock movement history for a product. | Admin, Warehouse |
| **POST** | `/products/:id/stock-adjustment` | Manually adjust the stock level of a product. | Admin, Warehouse |

## Challans (`/challans`)

| Method | Endpoint | Description | Roles |
| :--- | :--- | :--- | :--- |
| **GET** | `/challans` | List all challans (delivery notes). | Admin, Sales, Accounts, Warehouse |
| **POST** | `/challans` | Create a new challan. | Admin, Sales |
| **GET** | `/challans/:id` | Get specific challan details. | Admin, Sales, Accounts, Warehouse |
| **PUT** | `/challans/:id` | Update an existing challan. | Admin, Sales |
| **POST** | `/challans/:id/confirm` | Confirm a challan (e.g., mark as delivered/dispatched). | Admin, Sales |
| **POST** | `/challans/:id/cancel` | Cancel an existing challan. | Admin |

## Dashboard (`/dashboard`)

| Method | Endpoint | Description | Roles |
| :--- | :--- | :--- | :--- |
| **GET** | `/dashboard/stats` | Retrieve aggregate statistics and KPIs for the dashboard. | Authenticated |

---

### Request Formatting
- **Content-Type**: `application/json`
- **Authorization**: Endpoints marked as `Authenticated` or requiring specific roles expect a Bearer token in the `Authorization` header (`Authorization: Bearer <token>`).

### Error Handling
The API uses standardized error responses in the following format:
```json
{
  "message": "Error description",
  "errors": [] // Optional field containing validation errors
}
```
