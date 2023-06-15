"use strict";
/**
 *  Simple HTTP REST server + MongoDB (Mongoose)
 *
 *  Post and get simple text messages. Each message has a text content, a list of tags
 *  and an associated timestamp
 *  All the posted messages are stored in a MongoDB collection
 *
 *
 *  Endpoints          Attributes          Method        Description
 *
 *     /                  -                  GET         Returns the version and a list of available endpoints

 *     /courses          -                   POST        Post a new course
 *     /courses         ?id=<id>             DELETE      Delete a course by id
 *     /courses         ?category=           GET         Returns all the available courses, optionally filtered by category
 *                      ?skip=n
 *                      ?limit=m
 *
 *     /drinks          -                    POST        Post a new drink
 *     /drinks          ?id=<id>             DELETE      Delete a drink by id
 *     /drinks          ?skip=n              GET         Returns all the available drinks
 *                      ?limit=m
 *
 *     /orders          -                    POST        Post a new order
 *     /orders          ?id=<id>             DELETE      Delete a order by id
 *     /orders          ?status=             GET         Returns all the orders, optionally filtered by the status
 *                      ?skip=n
 *                      ?limit=m
 *     /orders/status   -                    UPDATE
 *     /orders/status   ?id=<id>             GET         Returns the status of a given order
 * ------------------------------------------------------------------------------------ */
Object.defineProperty(exports, "__esModule", { value: true });
const http = require("http"); // HTTP module
const url = require("url"); // url module is used to parse the query section of the URL
const colors = require("colors");
colors.enabled = true;
const mongoose = require("mongoose");
const order = require("./dbSchema/order");
const drink = require("./dbSchema/drink");
const course = require("./dbSchema/course");
var server = http.createServer(function (req, res) {
    // This function will be invoked asynchronously for every incoming connection
    console.log("New connection".inverse);
    console.log("REQUEST:");
    console.log("     URL: ".red + req.url);
    console.log("  METHOD: ".red + req.method);
    console.log(" Headers: ".red + JSON.stringify(req.headers));
    var body = "";
    req.on("data", function (chunk) {
        body = body + chunk;
    }).on("end", function () {
        console.log("Request end");
        var respond = function (status_code, response_data) {
            res.writeHead(status_code, { "Content-Type": "application/json" });
            res.write(JSON.stringify(response_data), "utf-8");
            res.end();
        };
        var urlParts = url.parse(req.url, true);
        var path = urlParts.pathname;
        // Define the routers
        const orderRegex = /^\/orders\/?(\w+)?\/?\??.*$/;
        const orderStausRegex = /^\/orders\/(\w+)\/status?\/?\??.*$/;
        const drinkRegex = /^\/drinks\/?(\w+)?\/?\??.*$/;
        const courseRegex = /^\/courses\/?(\w+)?\/?\??.*$/;
        if (path === "/" && req.method === "GET") {
            return respond(200, { api_version: "1.0", endpoints: ["/orders", "/drinks", "/courses"] });
        }
        else if (orderStausRegex.test(req.url) && req.method === "GET") {
            const id = req.url.match(orderStausRegex)[1];
            console.log(req.url.match(orderStausRegex));
            var filter = {};
            if (id)
                filter = { _id: id };
            order.getModel().find(filter).select("state")
                .then((documents) => {
                return respond(200, documents);
            }).catch((reason) => {
                return respond(404, { error: true, errormessage: "DB error:" + reason });
            });
        }
        else if (orderRegex.test(req.url) && req.method === "GET") {
            const id = req.url.match(orderRegex)[1];
            var filter = {};
            if (id)
                filter = { _id: id };
            handleGetRequest(respond, order, req, filter);
        }
        else if (drinkRegex.test(req.url) && req.method === "GET") {
            const id = req.url.match(drinkRegex)[1];
            var filter = {};
            if (id)
                filter = { _id: id };
            handleGetRequest(respond, drink, req, filter);
        }
        else if (courseRegex.test(req.url) && req.method === "GET") {
            const id = req.url.match(courseRegex)[1];
            console.log(req.url.match(courseRegex));
            var filter = {};
            if (id)
                filter = { _id: id };
            handleGetRequest(respond, course, req, filter);
        }
        else if (orderStausRegex.test(req.url) && req.method === "GET") {
            const id = req.url.match(courseRegex)[1];
            console.log(req.url.match(courseRegex));
            var filter = {};
            if (id)
                filter = { _id: id };
            return { status: handleGetRequest(respond, course, req, filter)['state'] };
        }
        else if (courseRegex.test(req.url) && req.method === "POST") {
            return handlePostRequest(respond, course.isCourse, course, body);
        }
        else if (drinkRegex.test(req.url) && req.method === "POST") {
            return handlePostRequest(respond, drink.isDrink, drink, body);
        }
        else if (orderRegex.test(req.url) && req.method === "POST") {
            return handlePostRequest(respond, order.isOrder, order, body);
        }
        else if (orderStausRegex.test(req.url) && req.method === "PUT") {
            const id = req.url.match(orderRegex)[1];
            var filter = {};
            if (id)
                filter = { _id: id };
            var recvedData = JSON.parse(body);
            order.getModel().findById(id, function (err, document) {
                if (err) {
                    return respond(404, { error: true, errormessage: "Error finding the order" });
                }
                else {
                    // Modifica il campo desiderato
                    document.state = recvedData['status'];
                    document.save(function (err, documentoModificato) {
                        if (err) {
                            return respond(404, { error: true, errormessage: "Error updating order status" });
                        }
                        else {
                            return respond(200, "Order updated");
                        }
                    });
                }
            });
        }
        else if (drinkRegex.test(req.url) && req.method === "DELETE") {
            const drinkIdMatch = req.url.match(drinkRegex);
            const id = drinkIdMatch && drinkIdMatch.length > 1 ? drinkIdMatch[1] : null;
            handleDeleteRequest(respond, drink, req, id);
        }
        else if (orderRegex.test(req.url) && req.method === "DELETE") {
            const orderIdMatch = req.url.match(orderRegex);
            const id = orderIdMatch && orderIdMatch.length > 1 ? orderIdMatch[1] : null;
            handleDeleteRequest(respond, order, req, id);
        }
        else if (courseRegex.test(req.url) && req.method === "DELETE") {
            const courseIdMatch = req.url.match(courseRegex);
            const id = courseIdMatch && courseIdMatch.length > 1 ? courseIdMatch[1] : null;
            handleDeleteRequest(respond, course, req, id);
        }
        else {
            return respond(404, { error: true, errormessage: "Invalid endpoint/method" });
        }
    });
});
function handleGetRequest(respond, model, req, idFilter) {
    var query = url.parse(req.url, true).query;
    console.log(" Query: ".red + JSON.stringify(query));
    var queryFilter = {};
    if (query.category)
        queryFilter = { category: query.category };
    console.log(" Filter: ".red + JSON.stringify(Object.assign(Object.assign({}, idFilter), queryFilter)));
    const skip = parseInt((query.skip || "0")) || 0;
    const limit = parseInt((query.limit || "20")) || 20;
    model.getModel().find(Object.assign(Object.assign({}, idFilter), queryFilter)).skip(skip).limit(limit)
        .then((documents) => {
        return respond(200, documents);
    }).catch((reason) => {
        return respond(404, { error: true, errormessage: "DB error:" + reason });
    });
}
function handlePostRequest(respond, dataCheckFunction, model, body) {
    console.log("Received: " + body);
    try {
        var recvedData = JSON.parse(body);
        if (dataCheckFunction(recvedData)) {
            model.getModel().create(recvedData).then((data) => {
                respond(200, { error: false, errormessage: "", id: data._id });
            }).catch((reason) => {
                console.log("1");
                return respond(404, { error: true, errormessage: "DB error" + reason });
            });
        }
        else {
            console.log("1");
            return respond(404, { error: true, errormessage: "Data is not a valid Message" });
        }
    }
    catch (e) {
        console.log("1");
        return respond(404, { error: true, errormessage: "JSON parse failed" });
    }
}
function handleDeleteRequest(respond, model, req, id) {
    var query = url.parse(req.url, true).query;
    console.log(" Query: ".red + JSON.stringify(query));
    model.getModel().findByIdAndDelete(id)
        .then((documents) => {
        return respond(200, documents);
    }).catch((reason) => {
        return respond(404, { error: true, errormessage: "DB error:" + reason });
    });
}
console.log("Starting the application)");
mongoose.connect('mongodb://localhost:27017/servit')
    .then(() => {
    console.log("Connected to MongoDB");
    return drink.getModel().countDocuments({}); // We explicitly return a promise-like object here
}).then((count) => {
    console.log("Collection contains " + count + " orders");
    if (count == 0) {
        console.log("Adding some test data into the database");
        var course1 = course.getModel().create({
            name: "Filetto di manzo",
            description: "filetto di manzo media cottura servito con patate e carote",
            price: 21,
            preparationTime: 15,
            category: "main"
        });
        var course2 = course.getModel().create({
            name: "Cheese cake",
            description: "fetta di cheese cake al limone",
            price: 8,
            preparationTime: 0,
            category: "dessert"
        });
        var drink1 = drink.getModel().create({
            name: "Coca cola",
            description: "Coca cola fredda",
            price: 2,
            size: "Medium"
        });
        var drink2 = drink.getModel().create({
            name: "Coca cola",
            description: "Coca cola fredda",
            price: 3,
            size: "Big"
        });
        var order1 = order.getModel().create({
            courses: [],
            drinks: [],
            state: "waiting",
            orderTime: "2020-04-19 14:13:00",
            table: 4
        });
        return Promise.all([course1, course2, drink1, drink2, order1]);
    }
    //return Promise.reject("Database is not empty!")
}).then(() => {
    console.log("DB initialized successfully."); // A function will be transformed to a promise already fullfilled
}).then(() => {
    // We can manually create a Promise for APIs that
    // normally accept a callback function
    return new Promise((resolve, reject) => {
        server.listen(8080, function () {
            console.log("HTTP Server started on port 8080");
            resolve(0);
        });
        server.on('error', (e) => { reject(e); });
    });
})
    .catch((reason) => {
    console.log("Error occurred while initializing the server:".red);
    console.log(reason);
}).finally(() => {
    console.log("Initialization complete");
});
//# sourceMappingURL=servitapi.js.map