const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');

// Charger les fichiers proto pour les vols et les hôtels
const flightProtoPath = 'flight.proto';
const hotelProtoPath = 'hotel.proto';

const flightProtoDefinition = protoLoader.loadSync(flightProtoPath, {
    keepCase: true,
    longs: String,
    enums: String,
    defaults: true,
    oneofs: true,
});

const hotelProtoDefinition = protoLoader.loadSync(hotelProtoPath, {
    keepCase: true,
    longs: String,
    enums: String,
    defaults: true,
    oneofs: true,
});

const flightProto = grpc.loadPackageDefinition(flightProtoDefinition).flight_service;
const hotelProto = grpc.loadPackageDefinition(hotelProtoDefinition).hotel_service;

// Définir les résolveurs pour les requêtes GraphQL
const resolvers = {
    Query: {
        hotel: (_, { id }) => {
            // Effectuer un appel gRPC au microservice d'hôtels
            const client = new hotelProto.HotelService('localhost:50052', grpc.credentials.createInsecure());
            return new Promise((resolve, reject) => {
                client.getHotel({ hotel_id: id }, (err, response) => {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(response.hotel);
                    }
                });
            });
        },
        hotels: () => {
            // Effectuer un appel gRPC au microservice d'hôtels
            const client = new hotelProto.HotelService('localhost:50052', grpc.credentials.createInsecure());
            return new Promise((resolve, reject) => {
                client.searchHotels({}, (err, response) => {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(response.hotels);
                    }
                });
            });
        },
        flight: (_, { id }) => {
            // Effectuer un appel gRPC au microservice de vols
            const client = new flightProto.FlightService('localhost:50051', grpc.credentials.createInsecure());
            return new Promise((resolve, reject) => {
                client.getFlight({ flight_id: id }, (err, response) => {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(response.flight);
                    }
                });
            });
        },
        flights: () => {
            // Effectuer un appel gRPC au microservice de vols
            const client = new flightProto.FlightService('localhost:50051', grpc.credentials.createInsecure());
            return new Promise((resolve, reject) => {
                client.searchFlights({}, (err, response) => {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(response.flights);
                    }
                });
            });
        },
    },
    Mutation: {
        addHotel: (_, { name, location }) => {
            // Effectuer un appel gRPC au microservice d'hôtels
            const client = new hotelProto.HotelService('localhost:50052', grpc.credentials.createInsecure());
            return new Promise((resolve, reject) => {
                client.addHotel({ name: name, location: location }, (err, response) => {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(response.hotel);
                    }
                });
            });
        },
        addFlight: (_, { airline, origin, destination }) => {
            // Effectuer un appel gRPC au microservice de vols
            const client = new flightProto.FlightService('localhost:50051', grpc.credentials.createInsecure());
            return new Promise((resolve, reject) => {
                client.addFlight({ airline: airline, origin: origin, destination: destination }, (err, response) => {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(response.flight);
                    }
                });
            });
        },
    },
};

module.exports = resolvers;
