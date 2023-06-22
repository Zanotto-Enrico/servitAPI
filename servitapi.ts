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
 *     /waiters/(:id)       -                   GET         Returns all the waiters or filters by id 
 *                          ?table=                             waiters filtered by the assigned table 
 *                          ?skip=n
 *                          ?limit=m
 * 
 *     /waiters/:id/tables/:tableNumber         PUT         To add a table to the waiter control
 *     /waiters/:id/tables/:tableNumber         DELETE      To remove a table from the waiter 
 * 
 * 
 *     /orders/:id/status   -                   PUT         Update the status of a given order
 *     /orders/:id/status   -                   GET         Returns the status of a given order
 * 1
 * ----------------------------------------------------------------------------------------------------------------- */



import http = require('http');                // HTTP module
import https = require('https');              // HTTPS module
import url = require('url');                  // url module is used to parse the query section of the URL
import fs = require('fs');                    // filesystem module
import colors = require('colors');
colors.enabled = true;

const result = require('dotenv').config()

if (result.error) {
  console.log("Unable to load \".env\" file. Please provide one to store the JWT secret key");
  process.exit(-1);
}
if( !process.env.JWT_SECRET ) {
  console.log("\".env\" file loaded but JWT_SECRET=<secret> key-value pair was not found");
  process.exit(-1);
}

import mongoose = require('mongoose');
import * as order from './dbSchema/order';
import * as drink from './dbSchema/drink';
import * as dish from './dbSchema/dish';
import * as user from './dbSchema/user';

import express = require('express');

import passport = require('passport');           // authentication middleware for Express
import passportHTTP = require('passport-http');  // implements Basic and Digest authentication for HTTP (used for /login endpoint)

import jsonwebtoken = require('jsonwebtoken');  // JWT generation
const { expressjwt: jwt } = require('express-jwt');            // JWT parsing middleware for express

import cors = require('cors');                  // Enable CORS middleware
const io = require('socket.io');               // Socket.io websocket library

// adding custom type definition to the Express types. 
declare global {
  namespace Express {
      interface User {
        mail:string,
        username: string,
        role: string,
        id: string,
        assignedTables: string[]
      }

      interface Request {
        auth: {
          username: string;
        }
      }
    }
}

let ios = undefined;
let app = express();

// generating the JWT authentication middleware
// provided by the express-jwt library.  
let auth = jwt( {
                  secret: process.env.JWT_SECRET, 
                  algorithms: ["HS256"]
                } );

// enabling the cross origin requests from my frontend
app.use(cors());

// body-parser extracts the entire body portion of an incoming request stream 
// and exposes it on req.body
app.use( express.json( ) );
app.use( (req,res,next) => {
  console.log("------------------------------------------------".inverse)
  console.log("New request for: "+req.url );
  console.log("Method: "+req.method);
  next();
})

app.get("/", (req,res) => {
    res.status(200).json( { api_version: "1.0", endpoints: [ "/orders", "/drinks", "/dishes", "/waiters" ] } ); 
});
app.route("/orders").get( auth, (req,res,next) => {
    handleGetRequest(res, next, req, order.getModel(), {})
}).post( auth, (req,res,next) => {
    return handlePostRequest(res, next, req, order.isOrder, order.getModel())
});
app.route("/drinks").get( auth, (req,res,next) => {
    handleGetRequest(res, next, req, drink.getModel(), {})
}).post( auth, (req,res,next) => {
    return handlePostRequest(res, next, req, drink.isDrink, drink.getModel())
});
app.route("/dishes").get( auth, (req,res,next) => {
    handleGetRequest(res, next, req, dish.getModel(), {})
}).post( auth, (req,res,next) => {
    return handlePostRequest(res, next, req, dish.isDish, dish.getModel())
});
app.route("/waiters").get( auth, (req,res,next) => {
    handleGetRequest(res, next, req, user.getModel(), {role : "WAITER"})
});
app.post('/users', (req,res,next) => {

    let u = user.newUser( req.body );
    if( !req.body.password ) {
      return next({ statusCode:404, error: true, errormessage: "Password field missing"} );
    }
    u.setPassword( req.body.password );
    console.log(u)

    u.save().then( (data) => {
        ios.emit('broadcast', data );
      return res.status(200).json({ error: false, errormessage: "", id: data._id });
    }).catch( (reason) => {
      if( reason.code === 11000 )
        return next({statusCode:404, error:true, errormessage: "User already exists"} );
      return next({ statusCode:404, error: true, errormessage: "DB error: "+reason.errmsg });
    })

});

app.route("/dishes/:dishid").get( auth, (req,res,next) => {
    return handleGetRequest(res, next, req, dish.getModel(),  { _id: mongoose.Types.ObjectId(req.params.dishid) })
});
app.route("/drinks/:drinkid").get( auth, (req,res,next) => {
    return handleGetRequest(res, next, req, drink.getModel(), { _id: mongoose.Types.ObjectId(req.params.drinkid) })
});
app.route("/orders/:orderid").get( auth, (req,res,next) => {
    return handleGetRequest(res, next, req, order.getModel(), { _id: mongoose.Types.ObjectId(req.params.orderid) })
});
app.route("/waiters/:waiterid").get( auth, (req,res,next) => {
    return handleGetRequest(res, next, req, user.getModel(),  { _id: mongoose.Types.ObjectId(req.params.waiterid) })
})

app.delete( '/dishes/:dishid', auth, (req,res,next) => {
    return handleDeleteRequest(res, next, req, dish.getModel(), req.params.dishid)
});
app.delete( '/drinks/:drinkid', auth, (req,res,next) => {
    return handleDeleteRequest(res, next, req, drink.getModel(), req.params.drinkid)
});
app.delete( '/orders/:orderid', auth, (req,res,next) => {
    return handleDeleteRequest(res, next, req, order.getModel(), req.params.orderid)
});
app.delete( '/waiters/:waiterid/tables/:tableNumber', auth, (req,res,next) => {
    //var recvedData = JSON.parse(res.body);
    user.getModel().findById(mongoose.Types.ObjectId(req.params.waiterid ), function(err, document) {
        if (err) {
            return next({ statusCode:404, error: true, errormessage: "Error finding the waiter"});
        } else {
            const index = document.assignedTables.indexOf(req.params.tableNumber);
            if (index !== -1) {
                document.assignedTables.splice(index, 1);
            }
            document.save(function(err) {
            if (err) {
                return next({ statusCode:404, error: true, errormessage: "Error removing the table from waiter list"});
            } else {
                ios.emit('broadcast', "" );
                return res.status(200).json( {error:false, errormessage:""} );
            }
            });
        }
    });
});

app.route('/orders/:orderid/status').get( auth, (req,res,next) => {
    handleGetRequest(res, next, req, order.getModel(), {_id : mongoose.Types.ObjectId(req.params.orderid )})
}).put( auth, (req,res,next) => {
    
    var recvedData = req.body
    order.getModel().findById(mongoose.Types.ObjectId(req.params.orderid ), function(err, document) {
        if (err) {
            return next({ statusCode:404, error: true, errormessage: "Error finding the order"});
        } else {
            document.status = recvedData['status'];
            console.log(recvedData['status'])
            document.save(function(err) {
            if (err) {
                return next({ statusCode:404, error: true, errormessage: "Error updating order status"});
            } else {
                return res.status(200).json( {error:false, errormessage:""} );
            }
            });
        }
    });
})

app.route('/waiters/:waiterid/tables/:tableNumber').put( auth, (req,res,next) => {
    //var recvedData = JSON.parse(res.body);
    user.getModel().findById(mongoose.Types.ObjectId(req.params.waiterid ), function(err, document) {
        if (err) {
            return next({ statusCode:404, error: true, errormessage: "Error finding the waiter"});
        } else {

            if (!document.assignedTables.includes(req.params.tableNumber)){
                user.getModel().exists({ assignedTables: req.params.tableNumber }, (err, result) => {
                    if (err) {
                        console.error('Errore durante la query:', err);
                        return;
                    }
                    if(!result)
                        document.assignedTables.push(req.params.tableNumber);
                    else
                        return next({ statusCode:404, error: true, errormessage: "Table of another waiter"});
                    document.save(function(err) {
                        if (err) {
                            return next({ statusCode:404, error: true, errormessage: "Error adding table to waiter"});
                        } else {
                            ios.emit('broadcast', "" );
                            return res.status(200).json( {error:false, errormessage:""} );
                        }
                    });
                })
            }
        }
    });
})

// Login endpoint uses passport middleware to check
// user credentials before generating a new JWT
app.get("/login", passport.authenticate('basic', { session: false }), (req,res,next) => {

    // generating a JWT with the useful user data
    // and return it as response
  
    let tokendata = {
      username: req.user.username,
      role: req.user.role,
      mail: req.user.mail,
      id: req.user.id,
      assignedTables: req.user.assignedTables
    };
  
    console.log("Login granted. Generating token" );
    let token_signed = jsonwebtoken.sign(tokendata, process.env.JWT_SECRET, { expiresIn: '1h' } );
  
    return res.status(200).json({ error: false, errormessage: "", token: token_signed });
  
  });
  
  
  // Add error handling middleware
  app.use( function(err,req,res,next) {
  
    console.log("Request error: ".red + JSON.stringify(err) );
    res.status( err.statusCode || 500 ).json( err );
  
  });
  

  app.use( (req,res,next) => {
    res.status(404).json({statusCode:404, error:true, errormessage: "Invalid endpoint"} );
  })



function handleGetRequest(res , next, req ,model , filter ){
    var query = url.parse( req.url, true ).query;
    console.log(" Query: ".red + JSON.stringify(query));


    // creating a filter based on the parameters of the query given 
    // checking also if the model given is compatible with the parameters of the query
    if( query.category && model.collection.name == dish.getModel().collection.name)
        filter = { category: query.category , ...filter};
    if( query.table && model.collection.name == order.getModel().collection.name) 
        filter = { table: query.table , ...filter};
    if( query.status && model.collection.name == order.getModel().collection.name) 
        filter = { status: query.status, ...filter };
    if( query.table && model.collection.name == user.getModel().collection.name) 
        filter = { assignedTables: { $in: [query.table] } , ...filter };
    
    console.log(" Filter: ".red + JSON.stringify(filter) );

    const skip = parseInt( <string>(query.skip || "0") ) || 0;
    const limit = parseInt( <string>(query.limit || "20") ) || 20;

    model.find( filter).skip( skip ).limit( limit )
    .then( (documents) => {
        return res.status(200).json( documents );
    }).catch( (reason) => {
        next({ statusCode:404, error: true, errormessage: "DB error: "+reason });
    })
}


function handlePostRequest(res , next, req ,  dataCheckFunction: (data) => boolean, model  ): void {
    console.log("Received: " + req.body);

    var recvedData = req.body;

    if( dataCheckFunction( recvedData ) ) {

        if(model.collection.name == order.getModel().collection.name) 
            /*if( !user.newUser(req.auth).assignedTables.includes(recvedData.table)){
                console.log(recvedData.table)
                console.log(user.newUser(req.auth).assignedTables)
                return next({ statusCode:404, error: true, errormessage: "table of the order not assigned to current waiter"});}*/

        model.create( recvedData ).then( ( data ) => {
            ios.emit('broadcast', data );
            return res.status(200).json({ error: false, errormessage: "", id: data._id });
        }).catch((reason) => {
            return next({ statusCode:404, error: true, errormessage: "DB error: "+reason });
        } )
    } else {
        return next({ statusCode:404, error: true, errormessage: "Data is not a valid " + model.collection.name });
    }
}
  
function handleDeleteRequest(res , next, req , model :  mongoose.Model< mongoose.Document > , id){
    var query = url.parse( req.url, true ).query;
    console.log("Delete request for " + model.collection.name + " id: "+req.params.messageid )
    console.log(" Query: ".red + JSON.stringify(query));

    model.deleteOne( {_id: mongoose.Types.ObjectId(id) } ).then( 
        ( q )=> {
          if( q.deletedCount > 0 ){
            ios.emit('broadcast', q );
            return res.status(200).json( {error:false, errormessage:""} );
          }
          else 
            return res.status(404).json( {error:true, errormessage:"Invalid ID"} );
      }).catch( (reason)=> {
          return next({ statusCode:404, error: true, errormessage: "DB error: "+reason });
      })
}

// HTTP basic authentication 
// trough passport middleware.
passport.use( new passportHTTP.BasicStrategy(
    function(username, password, done) {
  

      // passport middleware
      // to verify user credentials 
  
        console.log("New login attempt from ".green + username );
        user.getModel().findOne( {username: username} , (err, user)=>{
        if( err ) {
          return done( {statusCode: 500, error: true, errormessage:err} );
        }
  
        if( !user ) {
          return done(null,false,{statusCode: 500, error: true, errormessage:"Invalid user"});
        }
  
        if( user.validatePassword( password ) ) {
          return done(null, user);
        }
  
        return done(null,false,{statusCode: 500, error: true, errormessage:"Invalid password"});
      })
    }
  ));

console.log("Starting the application)");
mongoose.connect( 'mongodb://localhost:27017/servit' )
.then(
    () => {

        console.log("Connected to MongoDB");
        return drink.getModel().countDocuments({}); 
    }
).then(
    (count) => {
        console.log("Collection contains " + count + " orders");

        if (count == 0) {
            console.log("Adding some test data into the database");

            var dish1 = dish.getModel().create({
                name: "Filetto di manzo",
                description: "filetto di manzo media cottura servito con patate e carote",
                price: 21,
                preparationTime: 15,
                category: "main"
            })
            var dish2 = dish.getModel().create({
                name: "Cheese cake",
                description: "fetta di cheese cake al limone",
                price: 8,
                preparationTime: 0,
                category: "dessert"
            })
            var drink1 = drink.getModel().create({
                name: "Coca cola",
                description: "Coca cola fredda",
                price: 2,
                sizes: ["Big","Medium","Small"]
            })
            var drink2 = drink.getModel().create({
                name: "Sprite",
                description: "Coca cola fredda",
                price: 3,
                sizes: ["Medium"]
            })
            var order1 = order.getModel().create({
                status: "PREPARING",
                table: 12
            })
            var order1 = order.getModel().create({
                status: "READY",
                table: 9
            })
            var order1 = order.getModel().create({
                status: "IN-QUEUE",
                table: 4
            })
            var order1 = order.getModel().create({
                status: "SERVED",
                table: 6
            })

            /*var waiter1 = user.getModel().create({
                assignedTables: [12,14,22,33],
                mail: "jonny@jonny.com",
                username: "jonny",
                password: "password",
                role: "WAITER",
            })*/

            return Promise.all([dish1, dish2, drink1, drink2, order1]);
        }
        //return Promise.reject("Database is not empty!")
    }
).then( 
    () => {
        console.log("DB initialized successfully.");  // A function will be transformed to a promise already fullfilled
    }
).then(
    () => {
        let server = http.createServer(app);
    
        ios = io(server)
        ios.on('connection', function (client) {
          console.log("Socket.io client connected".green);
        });
    
        server.listen(8080, () => console.log("HTTP Server started on port 8080".green));
    
          // To start an HTTPS server we create an https.Server instance 
          // passing the express application middleware. Then, we start listening
          // on port 8443
          //
        /*
        https.createServer({
          key: fs.readFileSync('keys/key.pem'),
          cert: fs.readFileSync('keys/cert.pem')
        }, app).listen(8443, () => console.log("HTTP Server started on port 8443".green));
        */
      }
)
.catch( 
    (reason) => {
        console.log("Error occurred while initializing the server:".red )
        console.log( reason );
    }
).finally(
    ()=>{
        console.log("Initialization complete")
    }
);
