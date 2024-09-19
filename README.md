# Node.js Microservices Starter Project

This project is a Node.js starter template featuring three microservices: **Authentication Service**, **Notification Service**, and **Logger Service**. It also includes **phpMyAdmin** for managing the logger database and **Grafana** for visualizing log data. All services can be deployed and managed using Docker Compose.

## Features

### 1. Authentication Service
Handles user authentication and user management, including:
- Sign in
- Sign up
- Email verification
- Password reset
- Change password
- Authentication middleware
- User management

### 2. Notification Service
Responsible for sending emails, with the following features:
- Sends emails asynchronously
- Integrated with RabbitMQ for message queuing
- Other services can publish messages to the queue for email notifications

### 3. Logger Service
Logs important events and errors from other services:
- gRPC-based interface for logging
- Stores logs in a MySQL database
- Includes Grafana and phpMyAdmin for log management and visualization

## Prerequisites

- **Docker** and **Docker Compose** installed
- Basic understanding of microservices and containerization

## Getting Started

1. Clone the repository:

   ```bash
   git clone <repository-url>
   cd <repository-directory>

2. Create the `.env` files:
  - Each service (`authentication-service`, `notification-service`, and `logger-service`) has its own `.env` file. A global `.env` file exists at the root of the project for shared environment variables
   
3. Update the environment variables as needed in each `.env` file:
  - `authentication-service/.env`
  - `notification-service/.env`
  - `logger-service/.env`
  - Global `.env`

4. Build and run the services using Docker Compose:

   ```bash
   docker-compose up
   ```

5. The following services will be available after the build:
  - Authentication Service: `http://localhost:<port>`
  - Notification Service: `http://localhost:<port>`
  - Logger Service (gRPC): `localhost:<port>`
  - Grafana: `http://localhost:<port>`
  - phpMyAdmin: `http://localhost:<port>`

## Microservice Endpoints

### Authentication Service
### Authentication Service
| Endpoint                                     | Method  | Description               | Request Body                                                                                                                       |
| -------------------------------------------- | ------- | ------------------------- |------------------------------------------------------------------------------------------------------------------------------------|
| `/api/v1/auth/signup`                        | POST    | User sign-up              | `{ "name": "John doe", "email": "johndoe@gmail.com", "password": "john@doe!" }`                                                    |
| `/api/v1/auth/signin`                        | POST    | User sign-in              | `{ "email": "johndoe@gmail.com", "password": "john@doe!" }`                                                                        |
| `/api/v1/auth/send-email-verification`       | POST    | Send email verification   | `{ "email": "johndoe@gmail.com", "verificationType": "code" }`                                                                     |
| `/api/v1/auth/verify-email`                  | PATCH   | Verify email              | `{ "email": "johndoe@gmail.com", "verificationHashOrCode": "<code>", "verificationType": "code" }`                                 |
| `/api/v1/auth/send-password-reset-email`     | POST    | Send password reset email | `{ "email": "johndoe@gmail.com", "verificationType": "code" }`                                                                     |
| `/api/v1/auth/reset-password`                | POST    | Reset password            | `{ "email": "johndoe@gmail.com", "verificationType": "code", "verificationHashOrCode": "<code>", "newPassword": "<newpassword>" }` |
| `/api/v1/auth/change-password`               | PATCH   | Change password           | `{ "oldPassword": "demodemo2", "newPassword": "demodemo", "confirmPassword": "demodemo" }`                                         |
| `/api/v1/auth/authenticate`                  | POST    | Authenticate token        | No body required, token sent via Authorization header.                                                                             |
| `/api/v1/users?type=&from_date=&to_date=&...`| GET     | Fetch users               | No body required, token sent via Authorization header.                                                                             |
| `/api/v1/users/{userId}`                     | GET     | Fetch specific user       | No body required, token sent via Authorization header.                                                                             |
| `/api/v1/users/me`                           | GET     | Fetch current user        | No body required, token sent via Authorization header.                                                                             |
| `/api/v1/users/me`                           | PATCH   | Update current user       | `{ "name": "Default admin" }`                                                                                                      |


### Notification Service
- The Notification Service listens to RabbitMQ messages and processes email notifications.

### Logger Service
- The Logger Service accepts gRPC requests to log important events and errors. Logs are stored in a MySQL database accessible via Grafana and phpMyAdmin.

## Tools

- **phpMyAdmin**: View and manage the MySQL database storing logs at `http://localhost:8080`.
- **Grafana**: Visualize logs and metrics at `http://localhost:3000`.

## Environment Variables

Each service has its own `.env` file. Here's a list of key environment variables you might need to set:

### Authentication Service `.env`
```env
APP_NAME=auth-service
ENV=development
PORT=3000
HOST=http://localhost:3000
DB_URI=
JWT_SECRET=
RABBITMQ_HOST=amqp://rabbitmq:5672
LOGGER_HOST=logger_service:50051
DEFAULT_USER_EMAIL=admin@admin.com
DEFAULT_USER_PASSWORD=AdminPassword
```

### Notification Service `.env`
```env
APP_NAME=notification-service
ENV=development
PORT=5000
HOST=http://localhost:5000
RABBITMQ_HOST=amqp://rabbitmq:5672
LOGGER_HOST=logger_service:50051
EMAIL_HOST=
EMAIL_PORT=587
EMAIL_AUTH_USER=
EMAIL_AUTH_PASS=
EMAIL_SENDER_ADDR=
```

### Logger Service `.env`
```env
APP_NAME=logger-service
ENV=development
PORT=50051
BIND_ADDR=0.0.0.0
DB_HOST=logger_db
DB_PORT=3306
DB_USERNAME=
DB_PASSWORD=
DB_NAME=
JWT_SECRET=

#ENV variables for MySQL DB Container used by logger-service & phpmyadmin
MYSQL_ROOT_PASSWORD=
MYSQL_DATABASE=
MYSQL_USER=
MYSQL_PASSWORD=
PMA_HOST=

#ENV variables for Grafana
GF_SECURITY_ADMIN_PASSWORD=
```

### Main `.env`
```env
APP_SERVER_PRIVATE_IP=172.29.80.1
```

## Usage

1. Start all the services using Docker Compose.
2. You can manage the logger database using phpMyAdmin at `http://localhost:8080`.
3. View logs and visualize data using Grafana at `http://localhost:3000`.

### API Gateway - Kong

This section provides a `docker-compose.yml` file for setting up Kong as the API Gateway for your microservices architecture. It is recommended to run all microservices in one VM and the API Gateway in another. The global `.env` file mentioned above holds the private IP addresses of the VM hosting the microservices, ensuring secure internal communication.

#### Docker Compose for Kong API Gateway

```yaml
version: "3"

networks:
  kong-net:
    driver: bridge

services:
  
  # Kong API Gateway
  kong:
    container_name: kong
    image: kong:latest
    env_file:
      - .env
    ports:
      - "8000:8000"  # Exposes Kong for public API requests
      - "8001:8001


## Contributing

Feel free to submit issues or create pull requests to contribute to this project.

## License

This project is licensed under the MIT License.
