/* eslint-disable max-statements */
/* eslint-disable max-lines-per-function */
// URL-shortener microservice
// Setup
const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const dns = require("dns");
const mongoose = require("mongoose");
const models = require("./models/models");
const app = module.exports = express();
app.use(cors());
app.use(bodyParser.json());
mongoose.connect("mongodb+srv://Urlman:Urlman@cluster0-4cqwg.mongodb.net/test?retryWrites=true", {useNewUrlParser: true}, (err, db) => { 
	if (err) console.log("Error connecting to MongoDB", err); 
	console.log("Connected to MongoDB"); 
});

// Get info from client
app.get("/new/:longUrl", function(req, res, next) {
	// Variables
	let longUrl = req.params.longUrl;
	console.log(longUrl);
	let shortUrl = longUrl.split("/")[0];
	const regex = /(http(s)?:\/\/.)?(www\.)?[-a-zA-Z0-9@:%._+~#=]{2,256}\.[a-z‌]{2,6}\b([-a-zA-Z0-9‌@:%_+.~#?&=]*)/giu;
	let answer = {};
	// Testing for valid url
	if (regex.test(longUrl) === false) {
		answer = {"error":"url isn't in valid format"};
	}	
	// Test if address is already in database
	models.findOne({address: longUrl}, (err, data) => {
		if (err) { 
			return (err);
		}
		if (data != null && data.address == longUrl) {
			answer = {"original_url": longUrl, "short_url": data.shortAddress};
		}
		else {
			// Generate new short address
			let randomAddress = Math.floor(Math.random() * 1000000).toString();
			// Add address in database 
			let newAddress = new models({
				address: longUrl,
				shortAddress: randomAddress                                                                                                               
			});  
			newAddress.save((err) => {
				if (err) {
					answer = {"error":"saving to database failed"};
				}
			});
			answer = {"original_url": longUrl, "short_url": newAddress};
		}
		// Test for valid host address
		dns.lookup(shortUrl, (err, address, family) => {
			if (err) {
				answer = {"error":"invalid URL"};
			}
			// Send answer	
			res.json(answer);	
		});

	});
});

// Connect to website using shortAddress
app.get("/:forward", function(req, res, next) {
	let urlForward = req.params.forward;
	const regex2 = /^(http|https):/iu;
	models.findOne({"shortAddress": urlForward}, (err, data) => {
		if (err) {
			res.send("Error, not a valid number");
		}
		if (regex2.test(data.address) === true) {
			res.redirect(301, data.address);
		}
		else {
			res.redirect(301, "http://" + data.address);
		}	
	});
});

// Server listen
const listener = app.listen(process.env.PORT || 3000, function() {
	console.log("Listening port " + listener.address().port);
});