# Voyage Project

The **Voyages Project** offers a comprehensive solution for managing flights and hotel bookings through microservices. Designed with Node.js, gRPC, GraphQL, REST, and enhanced with Kafka for seamless communication, this application effectively handles CRUD operations for both flights and hotels.


![voyage Project](/archi.png.png)

## Features
- **Microservices architecture** with gRPC, GraphQL, REST, and Kafka
- **CRUD operations** for Flights and Hotels microservices
- **Communication** between services using gRPC and RESTful APIs
- **GraphQL endpoint** for flexible querying and data manipulation
- **Kafka** for message queuing and asynchronous communication between services

## Technologies
- Node.js
- gRPC
- GraphQL
- RESTful APIs
- MongoDB
- Kafka

## Getting Started

### Prerequisites
- Node.js 
- npm 
- MongoDB 
- GraphQL )

### Installation
1. Clone the repository: https://github.com/Rabeb125/voyages.git
2. Install the dependencies using npm:
   ```bash
   npm install

## Usage
### Start the Microservices
Start all microservices and the gateway in this order:


#### Flight Microservice
```bash
nodemon flightMicroservice.js
```
#### Hotel Microservice
```bash
nodemon hotelMicroservice.js
```
#### ApiGateway
```bash
nodemon apiGateway.js
```

## Running Services
- **Flight Service:** Runs on port '50051'
- **Hotel Service:** Runs on port 50052
- **MongoDB:** Runs on port 27017
- **Kafka:** Runs on port 9092
- **API Gateway:** Runs on port 3000

## API Endpoints
### Hotel Service
- **GET /hotels:** Retrieves all hotels.
- **GET /hotels/:id:** Retrieves a specific hotel by its ID.
- **POST /hotels/add:** Creates a new hotel.

### Flight Service
- **GET /flights:** Retrieves all flights.
- **GET /flights/:id:** Retrieves a specific flight by its ID.
- **POST /flights/add: :** Creates a new flight.

## Database
The project uses MongoDB as the database system. You can set up MongoDB locally or use a cloud-based MongoDB service. Make sure to update the database connection configuration in the project files accordingly.

## Contributing
Contributions are welcome! If you find any issues or have suggestions for improvement, please submit an issue or a pull request. For major changes, please open an issue first to discuss potential changes.