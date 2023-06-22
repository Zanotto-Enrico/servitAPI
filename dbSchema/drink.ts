
import mongoose = require('mongoose');


// An drink has a name and a brief description
export interface Drink {
    name: string,
    description: string,
    price: number,
    sizes: string[]
}


// checks if the supplied parameter is compatible with a given type
export function isDrink(arg: any): arg is Drink {
    return arg && arg.name && typeof(arg.name) == 'string' 
               && arg.description && typeof(arg.description) == 'string'
               && arg.price && typeof(arg.price) == 'number'
               && arg.sizes && Array.isArray(arg.sizes);
}



// Mongoose Schema of the Drink interface 
const drinkSchema = new mongoose.Schema( {
    name: {
        type: mongoose.SchemaTypes.String,
        required: true
    },
    description: {
        type: mongoose.SchemaTypes.String,
        required: true
    },
    price: {
        type: mongoose.SchemaTypes.Number,
        required: true
    },
    sizes: {
        type: [mongoose.SchemaTypes.String],
        required: true
    }

})
export function getSchema() { return drinkSchema; }

// Mongoose Model
let drinkModel: mongoose.Model< mongoose.Document >;  // This is not exposed outside the module

export function getModel() : mongoose.Model< mongoose.Document > { // Return Model as singleton
    if( !drinkModel ) {
        drinkModel = mongoose.model('Drink', getSchema() )
    }
    return drinkModel;
}