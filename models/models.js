// Create models for MongoDB database
const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const urlSchema = new Schema({
    address: String,
    shortAddress: Number
    }, {timestamps: true});

const ModelClass = mongoose.model("models", urlSchema);
module.exports = ModelClass;