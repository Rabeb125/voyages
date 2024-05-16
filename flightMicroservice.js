const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');
const mongoose = require('mongoose');
const Flight = require('./models/flightModel');
const { Kafka , Partitioners } = require('kafkajs'); // Ajoutez l'importation de kafkajs

const flightProtoPath = 'flight.proto';
const flightProtoDefinition = protoLoader.loadSync(flightProtoPath, {
    keepCase: true,
    longs: String,
    enums: String,
    defaults: true,
    oneofs: true,
});

const kafka = new Kafka({
    clientId: 'my-app',
    brokers: ['localhost:9092']
});

const producer = kafka.producer({
    createPartitioner: Partitioners.LegacyPartitioner
}); // Créez un producteur Kafka

const flightProto = grpc.loadPackageDefinition(flightProtoDefinition).flight_service;

const url = 'mongodb://localhost:27017/flightsDB';

mongoose.connect(url)
    .then(() => {
        console.log('Connected to database!');
    }).catch((err) => {
        console.log(err);
    });

const flightService = {
    getFlight: async (call, callback) => {
        await producer.connect();
        try {
            const flightId = call.request.flight_id;
            const flight = await Flight.findOne({ _id: flightId }).exec();
            if (!flight) {
                callback({ code: grpc.status.NOT_FOUND, message: 'Flight not found' });
                return;
            }
            callback(null, { flight });
        } catch (error) {
            await producer.send({
                topic: 'flights-topic', // Envoyez le message au topic 'flights-topic'
                messages: [{ value: `Error occurred while fetching flight: ${error}` }],
            });
            callback({ code: grpc.status.INTERNAL, message: 'Error occurred while fetching flight' });
        }
    },
    searchFlights: async (call, callback) => {
        try {
            const flights = await Flight.find({}).exec();
            await producer.connect();
            await producer.send({
                topic: 'flights-topic', // Envoyez le message au topic 'flights-topic'
                messages: [{ value: 'Searched for Flights' }],
            });
            callback(null, { flights });
        } catch (error) {
            await producer.send({
                topic: 'flights-topic',
                messages: [{ value: `Error occurred while fetching Flights: ${error}` }],
            });
            callback({ code: grpc.status.INTERNAL, message: 'Error occurred while fetching Flights' });
        }
    },
    addFlight: async (call, callback) => {
        const { airline, origin, destination } = call.request;
        const newFlight = new Flight({ airline, origin, destination });
        try {
            await producer.connect();
            await producer.send({
                topic: 'flights-topic', // Envoyez le message au topic 'flights-topic'
                messages: [{ value: JSON.stringify(newFlight) }],
            });
            await producer.disconnect();
            const savedFlight = await newFlight.save();
            callback(null, { flight: savedFlight });
        } catch (error) {
            callback({ code: grpc.status.INTERNAL, message: 'Error occurred while adding flight' });
        }
    }
};

const server = new grpc.Server();
server.addService(flightProto.FlightService.service, flightService);
const port = 50051;
server.bindAsync(`0.0.0.0:${port}`, grpc.ServerCredentials.createInsecure(),
    (err, port) => {
        if (err) {
            console.error('Failed to bind server:', err);
            return;
        }
        console.log(`Server is running on port ${port}`);
        server.start();
    });
console.log(`Flight microservice is running on port ${port}`);
