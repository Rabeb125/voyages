const { gql } = require('@apollo/server');

// Définir le schéma GraphQL
const typeDefs = `#graphql
type Hotel {
  id: String!
  name: String!
  location: String!
}

type Flight {
  id: String!
  airline: String!
  origin: String!
  destination: String!
}

type Query { #graphql
  hotel(id: String!): Hotel
  hotels: [Hotel]
  flight(id: String!): Flight
  flights: [Flight]
}

type Mutation { #graphql
  addHotel(name: String!, location: String!): Hotel
  addFlight(airline: String!, origin: String!, destination: String!): Flight
}
`;

module.exports = typeDefs;
