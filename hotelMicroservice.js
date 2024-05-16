const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');
const mongoose = require('mongoose');
const Hotel = require('./models/hotelModel');
const { Kafka  , Partitioners} = require('kafkajs'); // Ajoutez l'importation de kafkajs

const hotelProtoPath = 'hotel.proto';
const hotelProtoDefinition = protoLoader.loadSync(hotelProtoPath, {
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
});
 // Créez un producteur Kafka

const hotelProto = grpc.loadPackageDefinition(hotelProtoDefinition).hotel_service;

const url = 'mongodb://localhost:27017/hotelsDB';

mongoose.connect(url)
    .then(() => {
        console.log('Connected to database!');
    }).catch((err) => {
        console.log(err);
    });

const hotelService = {
    getHotel: async (call, callback) => {
        await producer.connect();
        try {
            const hotelId = call.request.hotel_id;
            const hotel = await Hotel.findOne({ _id: hotelId }).exec();
            if (!hotel) {
                callback({ code: grpc.status.NOT_FOUND, message: 'Hotel not found' });
                return;
            }
            callback(null, { hotel });
        } catch (error) {
            await producer.send({
                topic: 'hotels-topic', // Envoyez le message au topic 'hotels-topic'
                messages: [{ value: `Error occurred while fetching hotel: ${error}` }],
            });
            callback({ code: grpc.status.INTERNAL, message: 'Error occurred while fetching hotel' });
        }
    },
    searchHotels: async (call, callback) => {
        try {
            const hotels = await Hotel.find({}).exec();
            await producer.connect();
            await producer.send({
                topic: 'hotels-topic', // Envoyez le message au topic 'hotels-topic'
                messages: [{ value: 'Searched for Hotels' }],
            });
            callback(null, { hotels });
        } catch (error) {
            await producer.send({
                topic: 'hotels-topic',
                messages: [{ value: `Error occurred while fetching Hotels: ${error}` }],
            });
            callback({ code: grpc.status.INTERNAL, message: 'Error occurred while fetching Hotels' });
        }
    },
    addHotel: async (call, callback) => {
        const { name, location } = call.request;
        const newHotel = new Hotel({ name, location });
        try {
            await producer.connect();
            await producer.send({
                topic: 'hotels-topic', // Envoyez le message au topic 'hotels-topic'
                messages: [{ value: JSON.stringify(newHotel) }],
            });
            await producer.disconnect();
            const savedHotel = await newHotel.save();
            callback(null, { hotel: savedHotel });
        } catch (error) {
            callback({ code: grpc.status.INTERNAL, message: 'Error occurred while adding hotel' });
        }
    }
};

const server = new grpc.Server();
server.addService(hotelProto.HotelService.service, hotelService);
const port = 50052;
server.bindAsync(`0.0.0.0:${port}`, grpc.ServerCredentials.createInsecure(),
    (err, port) => {
        if (err) {
            console.error('Failed to bind server:', err);
            return;
        }
        console.log(`Server is running on port ${port}`);
        server.start();
    });
console.log(`Hotel microservice is running on port ${port}`);
