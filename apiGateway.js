const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const { ApolloServer } = require('apollo-server-express'); // Importez ApolloServer
const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');
const { Kafka } = require('kafkajs'); // Ajoutez l'importation de kafkajs
const resolvers = require('./resolvers');
const typeDefs = require('./schema');

const app = express();
app.use(bodyParser.json());
app.use(cors());

const flightProtoPath = './flight.proto';
const hotelProtoPath = './hotel.proto';

const flightProtoDefinition = protoLoader.loadSync(flightProtoPath, {
    keepCase: true,
    longs: String,
    enums: String,
    defaults: true,
    oneofs: true,
});
const flightProto = grpc.loadPackageDefinition(flightProtoDefinition).flight_service;

const hotelProtoDefinition = protoLoader.loadSync(hotelProtoPath, {
    keepCase: true,
    longs: String,
    enums: String,
    defaults: true,
    oneofs: true,
});
const hotelProto = grpc.loadPackageDefinition(hotelProtoDefinition).hotel_service;

const server = new ApolloServer({ typeDefs, resolvers });
server.start().then(() => {
    app.use(server.getMiddleware());
});

// Configuration de Kafka
const kafka = new Kafka({
    clientId: 'api-gateway',
    brokers: ['localhost:9092']
});

const consumer = kafka.consumer({ groupId: 'api-gateway-consumer' });

// Souscrire aux sujets Kafka
consumer.subscribe({ topic: 'flights-topic' }); // Changement ici
consumer.subscribe({ topic: 'hotels-topic' }); // Changement ici

// Connecter et exécuter le consommateur Kafka
(async () => {
    await consumer.connect();
    await consumer.run({
        eachMessage: async ({ topic, partition, message }) => {
            console.log(`Received message: ${message.value.toString()}, from topic: ${topic}`);
        },
    });
})();

app.get('/flights', (req, res) => {
    const client = new flightProto.FlightService('localhost:50051', grpc.credentials.createInsecure());
    client.searchFlights({}, (err, response) => {
        if (err) {
            res.status(500).send(err);
        } else {
            res.json(response.flights);
        }
    });
});

app.get('/flights/:id', (req, res) => {
    const client = new flightProto.FlightService('localhost:50051', grpc.credentials.createInsecure());
    const id = req.params.id;
    client.getFlight({ flight_id: id }, (err, response) => {
        if (err) {
            res.status(500).send(err);
        } else {
            res.json(response.flight);
        }
    });
});

app.post('/flights/add', (req, res) => {
    const client = new flightProto.FlightService('localhost:50051', grpc.credentials.createInsecure());
    const data = req.body;
    const { airline, origin, destination } = data;
    client.addFlight({ airline, origin, destination }, (err, response) => {
        if (err) {
            res.status(500).send(err);
        } else {
            res.json(response.flight);
        }
    });
});

app.get('/hotels', (req, res) => {
    const client = new hotelProto.HotelService('localhost:50052', grpc.credentials.createInsecure());
    client.searchHotels({}, (err, response) => {
        if (err) {
            res.status(500).send(err);
        } else {
            res.json(response.hotels);
        }
    });
});

app.get('/hotels/:id', (req, res) => {
    const client = new hotelProto.HotelService('localhost:50052', grpc.credentials.createInsecure());
    const id = req.params.id;
    client.getHotel({ hotel_id: id }, (err, response) => {
        if (err) {
            res.status(500).send(err);
        } else {
            res.json(response.hotel);
        }
    });
});

app.post('/hotels/add', (req, res) => {
    const client = new hotelProto.HotelService('localhost:50052', grpc.credentials.createInsecure());
    const data = req.body;
    const { name, location } = data;
    client.addHotel({ name, location }, (err, response) => {
        if (err) {
            res.status(500).send(err);
        } else {
            res.json(response.hotel);
        }
    });
});

const port = 3000;
app.listen(port, () => {
    console.log(`API Gateway is running on port ${port}`);
});
