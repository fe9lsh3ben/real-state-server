const express = require('express');
const authRouter = express.Router();
var requestValidator = require('./middlewareValidator.js')



authRouter.route('/')
    .post(requestValidator,(req,res,next)=> {
        
        
    })
    .get((req,res,next)=> {

    })
    .put((req,res,next)=> {

    });


module.exports = authRouter