
import mongoose = require('mongoose');
import { Dish } from './dish.js';
import { Drink } from './drink.js';

// An order contains info about drinks, dishs and table number
export interface Order {
    dishs: Dish[],
    dirnks: Drink[],
    status: string,
    orderTime: Date,
    table: number
}


// checks if the supplied parameter is compatible with a given type
export function isOrder(arg: any): arg is Order {
    return arg && arg.dishs && Array.isArray(arg.dishs) 
               && arg.drinks && Array.isArray(arg.drinks)
               && arg.status && typeof arg.status === 'string'
               && arg.orderTime && arg.orderTime instanceof Date
               && arg.table && arg.table instanceof Number;
}
  

// Mongoose Schema of the Order interface 
const orderSchema = new mongoose.Schema( {
    dishs: {
        type: [mongoose.SchemaTypes.String],
        required: true
    },
    drinks: {
        type: [mongoose.SchemaTypes.String],
        required: true
    },
    status:  {
        type: mongoose.SchemaTypes.String,
        required: true 
    },
    orderTime: {
        type: mongoose.SchemaTypes.Date,
        required: true
    },
    table: {
        type: mongoose.SchemaTypes.Number,
        required: true
    }
})
export function getSchema() { return orderSchema; }

// Mongoose Model
let orderModel: mongoose.Model< mongoose.Document >;  // This is not exposed outside the module

export function getModel() : mongoose.Model< mongoose.Document > { // Return Model as singleton
    if( !orderModel ) {
        orderModel = mongoose.model('Order', getSchema() )
    }
    return orderModel;
}