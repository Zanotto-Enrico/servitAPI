"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getModel = exports.getSchema = exports.isWaiter = void 0;
const mongoose = require("mongoose");
// checks if the supplied parameter is compatible with a given type
function isWaiter(arg) {
    return arg && arg.assignedTables && Array.isArray(arg.assignedTables)
        && arg.name && typeof arg.name === 'string';
}
exports.isWaiter = isWaiter;
// Mongoose Schema of the Waiter interface 
const waiterSchema = new mongoose.Schema({
    assignedTables: {
        type: [mongoose.SchemaTypes.Number],
        required: true
    },
    name: {
        type: mongoose.SchemaTypes.String,
        required: true
    }
});
function getSchema() { return waiterSchema; }
exports.getSchema = getSchema;
// Mongoose Model
let waiterModel; // This is not exposed outside the module
function getModel() {
    if (!waiterModel) {
        waiterModel = mongoose.model('Waiter', getSchema());
    }
    return waiterModel;
}
exports.getModel = getModel;
//# sourceMappingURL=waiter.js.map