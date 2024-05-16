const mongoose = require('mongoose');

const flightSchema = new mongoose.Schema({
    airline: String,
    origin: String,
    destination: String,
});

const Flight = mongoose.model('Flight', flightSchema);

module.exports = Flight;
