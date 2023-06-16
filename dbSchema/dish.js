"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getModel = exports.getSchema = exports.isDish = void 0;
const mongoose = require("mongoose");
// checks if the supplied parameter is compatible with a given type
function isDish(arg) {
    return arg && arg.name && typeof (arg.name) == 'string'
        && arg.price && typeof (arg.price) == 'number'
        && arg.preparationTime && typeof (arg.preparationTime) == 'number'
        && arg.description && typeof (arg.description) == 'string'
        && arg.category && typeof (arg.category) == 'string';
}
exports.isDish = isDish;
// Mongoose Schema of the Drink interface 
const drinkSchema = new mongoose.Schema({
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
});
function getSchema() { return drinkSchema; }
exports.getSchema = getSchema;
// Mongoose Model
let drinkModel; // This is not exposed outside the module
function getModel() {
    if (!drinkModel) {
        drinkModel = mongoose.model('Dish', getSchema());
    }
    return drinkModel;
}
exports.getModel = getModel;
//# sourceMappingURL=dish.js.map