const express = require('express');
const authRouter = express.Router();
var {requestValidator, signupValidator} = require('./middlewareValidator.js')



authRouter.route('/')
    .post(requestValidator, signupValidator,(req,res)=> {
        
        
        
    })
    .get((req,res,next)=> {

    })
    .put((req,res,next)=> {

    });


module.exports = authRouter