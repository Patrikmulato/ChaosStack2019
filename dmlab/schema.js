const mongoose = require("mongoose");

const apartmentSchema = new mongoose.Schema({
  title: {
    type: String
  },
  area: {
    type: String
  },
  property: {
    type: String
  },
  balcony: {
    type: String
  },
  room: {
    type: String
  },
  smallRoom: {
    type: String
  },
  condition: {
    type: String
  },
  floor: {
    type: String
  },
  views: {
    type: String
  },
  date: {
    type: String
  }
});

module.exports = apartmentSchema;
