
const {T_AND_C} = require('../routes/1-terms&condition_route');
const {profile} = require('../routes/2-profile_route');
const {REO} = require('../routes/3-RE_office_route');
const {FalLicense} = require('../routes/4-FalLicense_rout');
const {REU} = require('../routes/5-RE_unit_route');
const {Contract} = require('../routes/7-contract_route');
const {RE_AD} = require('../routes/6-READ_route');

module.exports = {
    
    T_AND_C,
    profile,
    REO,
    FalLicense,
    REU,
    Contract,
    RE_AD
    
}