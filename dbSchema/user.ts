
import mongoose = require('mongoose');
import crypto = require('crypto');


// User data interface  
export interface User  extends mongoose.Document{
    assignedTables: number[],
    mail:string,
    username: string,
    role: string,
    salt: string,       // password salt
    digest: string,     // password hash
    setPassword: (pwd:string)=>void,
    validatePassword: (pwd:string)=>boolean,
    hasWaiterRole: ()=>boolean,
    setWaiter: ()=>void,
    hasCookRole: ()=>boolean,
    setCook: ()=>void,
    hasCashierRole: ()=>boolean,
    setCashier: ()=>void,
    hasBartenderRole: ()=>boolean,
    setBartender: ()=>void
}


// checks if the supplied parameter is compatible with a given type
export function isUser(arg: any): arg is User {
    return arg && arg.assignedTables && Array.isArray(arg.assignedTables) 
               && arg.username && typeof arg.username === 'string'
               && arg.mail && typeof arg.mail === 'string'
               && arg.role && typeof arg.role === 'string'
               && arg.salt && typeof arg.salt === 'string'
               && arg.digest && typeof arg.digest === 'string'
}
  

// Mongoose Schema of the User interface 
const userSchema = new mongoose.Schema<User>( {
    assignedTables: {
        type: [mongoose.SchemaTypes.Number],
        required: true
    },
    username:  {
        type: mongoose.SchemaTypes.String,
        required: true ,
        unique: true
    },
    mail:  {
        type: mongoose.SchemaTypes.String,
        required: true 
    },
    role:  {
        type: mongoose.SchemaTypes.String,
        required: true 
    },
    salt:  {
        type: mongoose.SchemaTypes.String,
        required: false 
    },
    digest:  {
        type: mongoose.SchemaTypes.String,
        required: false 
    }
})

// Here we add some methods to the user Schema

userSchema.methods.setPassword = function( pwd:string ) {

    this.salt = crypto.randomBytes(16).toString('hex'); // We use a random 16-bytes hex string for salt
    const hmac = crypto.createHmac('sha512', this.salt );
    hmac.update( pwd );
    this.digest = hmac.digest('hex'); // The final digest depends both by the password and the salt
}

userSchema.methods.validatePassword = function( pwd:string ):boolean {

    const hmac = crypto.createHmac('sha512', this.salt );
    hmac.update(pwd);
    const digest = hmac.digest('hex');
    return (this.digest === digest);
}

userSchema.methods.hasWaiterRole = function(): boolean {
    if( this.role === 'WAITER' )
        return true;
    return false;
}

userSchema.methods.setWaiter = function() {
    if( !this.hasWaiterRole() )
        this.role = "WAITER";
}

userSchema.methods.hasCookRole = function(): boolean {
    if( this.role === 'COOK' )
        return true;
    return false;
}

userSchema.methods.setCook = function() {
    if( !this.hasCookRole() )
        this.role = "COOK";
}

userSchema.methods.hasCashierRole = function(): boolean {
    if( this.role === 'CASHIER' )
        return true;
    return false;
}

userSchema.methods.setCashier = function() {
    if( !this.hasCashierRole() )
        this.role = "CASHIER";
}

userSchema.methods.hasBartenderRole = function(): boolean {
    if( this.role === 'BARTENDER' )
        return true;
    return false;
}

userSchema.methods.setBartender = function() {
    if( !this.hasBartenderRole() )
        this.role = "BARTENDER";
}



export function getSchema() { return userSchema; }

// Mongoose Model
let userModel;  // This is not exposed outside the model
export function getModel() : mongoose.Model< User >  { // Return Model as singleton
    if( !userModel ) {
        userModel = mongoose.model('User', getSchema() )
    }
    return userModel;
}

export function newUser( data ): User {
    let _usermodel = getModel();
    let user = new _usermodel( data );

    return user;
}