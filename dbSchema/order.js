"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getModel = exports.getSchema = exports.isOrder = void 0;
const mongoose = require("mongoose");
// checks if the supplied parameter is compatible with a given type
function isOrder(arg) {
    return arg && arg.dishes && Array.isArray(arg.dishes)
        && arg.drinks && Array.isArray(arg.drinks)
        && arg.table && typeof (arg.table) === 'number';
}
exports.isOrder = isOrder;
// Mongoose Schema of the Order interface 
const orderSchema = new mongoose.Schema({
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
    status: {
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