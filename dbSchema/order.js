"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getModel = exports.getSchema = exports.isOrder = void 0;
const mongoose = require("mongoose");
// checks if the supplied parameter is compatible with a given type
function isOrder(arg) {
    return arg && arg.courses && Array.isArray(arg.courses)
        && arg.drinks && Array.isArray(arg.drinks)
        && arg.state && typeof arg.state === 'string'
        && arg.orderTime && arg.orderTime instanceof Date
        && arg.table && arg.table instanceof Number;
}
exports.isOrder = isOrder;
// Mongoose Schema of the Order interface 
const orderSchema = new mongoose.Schema({
    courses: {
        type: [mongoose.SchemaTypes.String],
        required: true
    },
    drinks: {
        type: [mongoose.SchemaTypes.String],
        required: true
    },
    state: {
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
});
function getSchema() { return orderSchema; }
exports.getSchema = getSchema;
// Mongoose Model
let orderModel; // This is not exposed outside the module
function getModel() {
    if (!orderModel) {
        orderModel = mongoose.model('Order', getSchema());
    }
    return orderModel;
}
exports.getModel = getModel;
//# sourceMappingURL=order.js.map