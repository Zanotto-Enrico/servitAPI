"use strict";
/**------------------------------------------------------------------------------------------------------------------*\
 *  Simple HTTP REST server + MongoDB (Mongoose)
 *
 *
 *  Endpoints          Attributes             Method                 Description
 *
 *     /                    -                   GET         Returns the version and a list of available endpoints
 *
 *     /dishes              -                   POST        Post a new dish
 *     /dishes/:id          -                   DELETE      Delete a dish by id
 *     /dishes/(:id)        -                   GET         Returns all the available dishes or filters by id
 *                          ?category=                          filtered by category
 *                          ?skip=n
 *                          ?limit=m
 *
 *     /drinks              -                   POST        Post a new drink
 *     /drinks/:id          -                   DELETE      Delete a drink by id
 *     /drinks/(:id)        -                   GET         Returns all the available drinks or filters by id
 *                          ?skip=n
 *                          ?limit=m
 *
 *     /orders              -                   POST        Post a new order
 *     /orders/:id          -                   DELETE      Delete an order by id
 *     /orders/(:id)        -                   GET         Returns all the orders or filters by id
 *                          ?status=                            filtered by the status
 *                          ?table=                             filtered by the table
 *                          ?skip=n
 *                          ?limit=m
 *
 *     /waiters             -                   POST        Post a new waiter
 *     /waiters/:id         -                   DELETE      Delete a waiter by id
 *     /waiters/(:id)       -                   GET         Returns all the waiters or filters by id
 *                          ?table=                             filtered by the table
 *                          ?skip=n
 *                          ?limit=m
 *
 *     /orders/:id/status   -                   PUT         Update the status of a given order
 *     /orders/:id/status   -                   GET         Returns the status of a given order
 * 1
 * ----------------------------------------------------------------------------------------------------------------- */
Object.defineProperty(exports, "__esModule", { value: true });
const http = require("http"); // HTTP module
const url = require("url"); // url module is used to parse the query section of the URL
const colors = require("colors");
colors.enabled = true;
const mongoose = require("mongoose");
const order = require("./dbSchema/order");
const drink = require("./dbSchema/drink");
const dish = require("./dbSchema/dish");
const waiter = require("./dbSchema/waiter");
var server = http.createServer(function (req, res) {
    // This function will be invoked asynchronously for every incoming connection
    console.log("New connection".inverse);
    console.log(" REQUEST: ");
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
        var path = url.parse(req.url, true).pathname;
        // Defining the regex matching every endpoint
        const orderRegex = /^\/orders\/?(\w+)?\/?\??.*$/;
        const orderStausRegex = /^\/orders\/(\w+)\/status?\/?\??.*$/;
        const drinkRegex = /^\/drinks\/?(\w+)?\/?\??.*$/;
        const dishRegex = /^\/dishes\/?(\w+)?\/?\??.*$/;
        const waiterRegex = /^\/waiters\/?(\w+)?\/?\??.*$/;
        if (path === "/" && req.method === "GET") {
            return respond(200, { api_version: "1.0", endpoints: ["/orders", "/drinks", "/dishes", "/waiters"] });
        }
        else if (orderStausRegex.test(req.url) && req.method === "GET") {
            const id = req.url.match(orderStausRegex)[1];
            console.log(req.url.match(orderStausRegex));
            var filter = {};
            if (id)
                filter = { _id: id };
            order.getModel().find(filter).select("status")
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
            handleGetRequest(respond, order.getModel(), req, filter);
        }
        else if (drinkRegex.test(req.url) && req.method === "GET") {
            const id = req.url.match(drinkRegex)[1];
            var filter = {};
            if (id)
                filter = { _id: id };
            handleGetRequest(respond, drink.getModel(), req, filter);
        }
        else if (dishRegex.test(req.url) && req.method === "GET") {
            const id = req.url.match(dishRegex)[1];
            console.log(req.url.match(dishRegex));
            var filter = {};
            if (id)
                filter = { _id: id };
            handleGetRequest(respond, dish.getModel(), req, filter);
        }
        else if (waiterRegex.test(req.url) && req.method === "GET") {
            const id = req.url.match(waiterRegex)[1];
            console.log(req.url.match(waiterRegex));
            var filter = {};
            if (id)
                filter = { _id: id };
            handleGetRequest(respond, waiter.getModel(), req, filter);
        }
        else if (dishRegex.test(req.url) && req.method === "POST") {
            return handlePostRequest(respond, dish.isDish, dish.getModel(), body);
        }
        else if (drinkRegex.test(req.url) && req.method === "POST") {
            return handlePostRequest(respond, drink.isDrink, drink.getModel(), body);
        }
        else if (orderRegex.test(req.url) && req.method === "POST") {
            return handlePostRequest(respond, order.isOrder, order.getModel(), body);
        }
        else if (waiterRegex.test(req.url) && req.method === "POST") {
            return handlePostRequest(respond, waiter.isWaiter, waiter.getModel(), body);
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
                    document.status = recvedData['status'];
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
            handleDeleteRequest(respond, drink.getModel(), req, id);
        }
        else if (orderRegex.test(req.url) && req.method === "DELETE") {
            const orderIdMatch = req.url.match(orderRegex);
            const id = orderIdMatch && orderIdMatch.length > 1 ? orderIdMatch[1] : null;
            handleDeleteRequest(respond, order.getModel(), req, id);
        }
        else if (dishRegex.test(req.url) && req.method === "DELETE") {
            const dishIdMatch = req.url.match(dishRegex);
            const id = dishIdMatch && dishIdMatch.length > 1 ? dishIdMatch[1] : null;
            handleDeleteRequest(respond, dish.getModel(), req, id);
        }
        else {
            return respond(404, { error: true, errormessage: "Invalid endpoint/method" });
        }
    });
});
function handleGetRequest(respond, model, req, filter) {
    var query = url.parse(req.url, true).query;
    console.log(" Query: ".red + JSON.stringify(query));
    // creating a filter based on the parameters of the query given 
    // checking also if the model given is compatible with the parameters of the query
    if (query.category && model.collection.name == dish.getModel().collection.name)
        filter = Object.assign({ category: query.category }, filter);
    if (query.table && model.collection.name == order.getModel().collection.name)
        filter = Object.assign({ table: query.table }, filter);
    if (query.status && model.collection.name == order.getModel().collection.name)
        filter = Object.assign({ status: query.status }, filter);
    if (query.table && model.collection.name == waiter.getModel().collection.name)
        filter = Object.assign({ assignedTables: { $in: [query.table] } }, filter);
    console.log(" Filter: ".red + JSON.stringify(filter));
    const skip = parseInt((query.skip || "0")) || 0;
    const limit = parseInt((query.limit || "20")) || 20;
    model.find(filter).skip(skip).limit(limit)
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
            model.create(recvedData).then((data) => {
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
    model.findByIdAndDelete(id)
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
        var dish1 = dish.getModel().create({
            name: "Filetto di manzo",
            description: "filetto di manzo media cottura servito con patate e carote",
            price: 21,
            preparationTime: 15,
            category: "main"
        });
        var dish2 = dish.getModel().create({
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
            dishes: [],
            drinks: [],
            status: "waiting",
            orderTime: "2020-04-19 14:13:00",
            table: 4
        });
        var waiter1 = waiter.getModel().create({
            assignedTables: [12, 14, 22, 33],
            name: "Alfredo Mescaldo",
        });
        return Promise.all([dish1, dish2, drink1, drink2, order1]);
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