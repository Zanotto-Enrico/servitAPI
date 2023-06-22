
import mongoose = require('mongoose');
import { Dish } from './dish.js';
import { Drink } from './drink.js';

// An order contains info about drinks, dishes and table number
export interface Order {
    dishes: Dish[],
    dirnks: Drink[],
    status: string,
    orderTime: Date,
    table: number
}


// checks if the supplied parameter is compatible with a given type
export function isOrder(arg: any): arg is Order {
    return arg && arg.dishes && Array.isArray(arg.dishes) 
               && arg.drinks && Array.isArray(arg.drinks)
               && arg.table && typeof(arg.table) === 'number';
}
  

// Mongoose Schema of the Order interface 
const orderSchema = new mongoose.Schema( {
    dishes: {
        type: [mongoose.SchemaTypes.String],
        required: true,
        default: () => []
    },
    drinks: {
        type: [mongoose.SchemaTypes.String],
        required: true,
        default: () => []
    },
    status:  {
        type: mongoose.SchemaTypes.String,
        required: true,
        default: () => "IN-QUEUE"
    },
    orderTime: {
        type: mongoose.SchemaTypes.Date,
        required: true,
        default: () => new Date()
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