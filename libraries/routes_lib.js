
const {T_AND_C} = require('../routes/terms&condition_route');
const {signup, login, changeUserType, getProfile, editProfile} = require('../routes/profile_route');
const {REO} = require('../routes/real_estate_office_route');
const {REU} = require('../routes/real_estate_unit_route');
const {Contract} = require('../routes/contract_route');
const {RE_AD} = require('../routes/RE_AD_route');

module.exports = {
    
    T_AND_C,
    signup, login, getProfile, editProfile, changeUserType,
    REO,
    REU,
    Contract,
    RE_AD
    
}