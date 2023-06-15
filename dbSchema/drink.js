"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getModel = exports.getSchema = exports.isDrink = void 0;
const mongoose = require("mongoose");
// checks if the supplied parameter is compatible with a given type
function isDrink(arg) {
    return arg && arg.name && typeof (arg.name) == 'string'
        && arg.description && typeof (arg.description) == 'string'
        && arg.price && typeof (arg.price) == 'number'
        && arg.sizes && Array.isArray(arg.sizes);
}
exports.isDrink = isDrink;
// Mongoose Schema of the Drink interface 
const drinkSchema = new mongoose.Schema({
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
    size: {
        type: mongoose.SchemaTypes.String,
        required: true
    }
});
function getSchema() { return drinkSchema; }
exports.getSchema = getSchema;
// Mongoose Model
let drinkModel; // This is not exposed outside the module
function getModel() {
    if (!drinkModel) {
        drinkModel = mongoose.model('Drink', getSchema());
    }
    return drinkModel;
}
exports.getModel = getModel;
//# sourceMappingURL=drink.js.map