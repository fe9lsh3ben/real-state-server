
var express = require('express');
const bcrypt = require('bcrypt');
var https = require('https');
var http = require('http');
var cors = require('cors');
var fs = require('fs');
const cookieParser = require("cookie-parser");


async function dbErrorHandler(res, error, refrence = '') {

    if (error.code === 'P2002') {
        res.status(409).json({ message: 'Duplicate value for a unique field.' });
    } else if (error.code === 'P2003') {
        res.status(400).json({ message: 'Foreign key constraint failed.' });
    } else if (error.code === 'P2025') {
        res.status(404).json({ message: 'Record not found.' });
    } else {
        res.status(500).json({ message: `Internal server error ${refrence}.` });
    }

}

function mapAddressToScalars(address) {
    if (!address) return {};
    return {
        Region: address.Region,
        City: address.City,
        District: address.District,
        Direction: address.Direction,
        Latitude: address.Latitude,
        Longitude: address.Longitude,
    };
}
 

module.exports = {
    cookieParser,
    express,
    bcrypt,
    https,
    http,
    cors,
    fs,
    dbErrorHandler,
    mapAddressToScalars
}