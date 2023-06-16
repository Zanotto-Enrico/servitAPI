"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.newUser = exports.getModel = exports.getSchema = exports.isUser = void 0;
const mongoose = require("mongoose");
const crypto = require("crypto");
// checks if the supplied parameter is compatible with a given type
function isUser(arg) {
    return arg && arg.assignedTables && Array.isArray(arg.assignedTables)
        && arg.username && typeof arg.username === 'string'
        && arg.mail && typeof arg.mail === 'string'
        && arg.role && typeof arg.role === 'string'
        && arg.salt && typeof arg.salt === 'string'
        && arg.digest && typeof arg.digest === 'string';
}
exports.isUser = isUser;
// Mongoose Schema of the User interface 
const userSchema = new mongoose.Schema({
    assignedTables: {
        type: [mongoose.SchemaTypes.Number],
        required: true
    },
    username: {
        type: mongoose.SchemaTypes.String,
        required: true,
        unique: true
    },
    mail: {
        type: mongoose.SchemaTypes.String,
        required: true
    },
    role: {
        type: mongoose.SchemaTypes.String,
        required: true
    },
    salt: {
        type: mongoose.SchemaTypes.String,
        required: false
    },
    digest: {
        type: mongoose.SchemaTypes.String,
        required: false
    }
});
// Here we add some methods to the user Schema
userSchema.methods.setPassword = function (pwd) {
    this.salt = crypto.randomBytes(16).toString('hex'); // We use a random 16-bytes hex string for salt
    const hmac = crypto.createHmac('sha512', this.salt);
    hmac.update(pwd);
    this.digest = hmac.digest('hex'); // The final digest depends both by the password and the salt
};
userSchema.methods.validatePassword = function (pwd) {
    const hmac = crypto.createHmac('sha512', this.salt);
    hmac.update(pwd);
    const digest = hmac.digest('hex');
    return (this.digest === digest);
};
userSchema.methods.hasWaiterRole = function () {
    if (this.role === 'WAITER')
        return true;
    return false;
};
userSchema.methods.setWaiter = function () {
    if (!this.hasWaiterRole())
        this.role = "WAITER";
};
userSchema.methods.hasCookRole = function () {
    if (this.role === 'COOK')
        return true;
    return false;
};
userSchema.methods.setCook = function () {
    if (!this.hasCookRole())
        this.role = "COOK";
};
userSchema.methods.hasCashierRole = function () {
    if (this.role === 'CASHIER')
        return true;
    return false;
};
userSchema.methods.setCashier = function () {
    if (!this.hasCashierRole())
        this.role = "CASHIER";
};
userSchema.methods.hasBartenderRole = function () {
    if (this.role === 'BARTENDER')
        return true;
    return false;
};
userSchema.methods.setBartender = function () {
    if (!this.hasBartenderRole())
        this.role = "BARTENDER";
};
function getSchema() { return userSchema; }
exports.getSchema = getSchema;
// Mongoose Model
let userModel; // This is not exposed outside the model
function getModel() {
    if (!userModel) {
        userModel = mongoose.model('User', getSchema());
    }
    return userModel;
}
exports.getModel = getModel;
function newUser(data) {
    let _usermodel = getModel();
    let user = new _usermodel(data);
    return user;
}
exports.newUser = newUser;
//# sourceMappingURL=user.js.map