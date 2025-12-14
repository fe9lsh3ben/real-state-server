
var express = require('express');
const bcrypt = require('bcrypt');
var https = require('https');
var http = require('http');
var cors = require('cors');
var fs = require('fs');
const cookieParser = require("cookie-parser");


async function dbErrorHandler(res, error, refrence) {

    if (error.code === 'P2002') {
        res.status(409).json({ 'message': `From Error Handler Duplicate value for a unique field.` });
    } else if (error.code === 'P2003') {
        res.status(400).json({ 'message': 'From Error Handler Foreign key constraint failed.' });
    } else if (error.code === 'P2025') {
        res.status(404).json({ 'message': 'From Error Handler Record not found.' });
    } else {
        res.status(500).json({ 'message': `From Error Handler Internal server error: ${refrence ?? ''}.` });
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


const SearchType = Object.freeze({

    // --- Public Queries ---
    DETAIL_VIEW: 'detail_view',
    LIST_VIEW: 'list_view',
    MAP_PINS_VIEW: 'map_pins_view',
    CUSTOM_FILTER_QUERY: 'custom_filter_query',

    // --- Office's Queries ---
    OFFICE_DETAIL_VIEW: 'office_detail_view',
    OFFICE_LIST_VIEW: 'office_list_view',
    OFFICE_MAP_PINS_VIEW: 'office_map_pins_view',
    OFFICE_CUSTOM_FILTER_QUERY: 'office_custom_filter_query',

});

module.exports = {
    cookieParser,
    express,
    bcrypt,
    https,
    http,
    cors,
    fs,
    SearchType,
    dbErrorHandler,
    mapAddressToScalars
}