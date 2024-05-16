const mongoose = require('mongoose');

const hotelSchema = new mongoose.Schema({
    name: String,
    location: String,
});

const Hotel = mongoose.model('Hotel', hotelSchema);

module.exports = Hotel;
