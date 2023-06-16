
import mongoose = require('mongoose');

// waiter contains their's name and a list of assigned tables 
export interface Waiter {
    assignedTables: number[],
    name: string,
}


// checks if the supplied parameter is compatible with a given type
export function isWaiter(arg: any): arg is Waiter {
    return arg && arg.assignedTables && Array.isArray(arg.assignedTables) 
               && arg.name && typeof arg.name === 'string'
}
  

// Mongoose Schema of the Waiter interface 
const waiterSchema = new mongoose.Schema( {
    assignedTables: {
        type: [mongoose.SchemaTypes.Number],
        required: true
    },
    name:  {
        type: mongoose.SchemaTypes.String,
        required: true 
    }
})
export function getSchema() { return waiterSchema; }

// Mongoose Model
let waiterModel: mongoose.Model< mongoose.Document >;  // This is not exposed outside the module

export function getModel() : mongoose.Model< mongoose.Document > { // Return Model as singleton
    if( !waiterModel ) {
        waiterModel = mongoose.model('Waiter', getSchema() )
    }
    return waiterModel;
}