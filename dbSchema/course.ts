
import mongoose = require('mongoose');


// An drink has a name and a brief description
export interface Course {
    name: string,
    price: number,
    preparationTime: number,
    description: string,
    category: string
}


// checks if the supplied parameter is compatible with a given type
export function isCourse(arg: any): arg is Course {
    return arg && arg.name && typeof(arg.name) == 'string' 
               && arg.price && typeof(arg.price) == 'number'
               && arg.preparationTime && typeof(arg.preparationTime) == 'number'
               && arg.description && typeof(arg.description) == 'string'
               && arg.category && typeof(arg.category) == 'string';
}


// Mongoose Schema of the Drink interface 
const drinkSchema = new mongoose.Schema( {
    name: {
        type: mongoose.SchemaTypes.String,
        required: true
    },
    price: {
        type: mongoose.SchemaTypes.Number,
        required: true
    },
    preparationTime: {
        type: mongoose.SchemaTypes.Number,
        required: true
    },
    description: {
        type: mongoose.SchemaTypes.String,
        required: true
    },
    category: {
        type: mongoose.SchemaTypes.String,
        required: true
    }
})
export function getSchema() { return drinkSchema; }

// Mongoose Model
let drinkModel: mongoose.Model< mongoose.Document >;  // This is not exposed outside the module

export function getModel() : mongoose.Model< mongoose.Document > { // Return Model as singleton
    if( !drinkModel ) {
        drinkModel = mongoose.model('Course', getSchema() )
    }
    return drinkModel;
}