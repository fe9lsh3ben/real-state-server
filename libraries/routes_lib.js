
const {T_AND_C} = require('../routes/terms&condition_route');
const {signup, login, changeUserType} = require('../routes/profile_route');
const {REO} = require('../routes/real_estate_office_route');
const {contract} = require('../routes/contract_route');
const {RE_AD} = require('../routes/RE_AD_route');

module.exports = {T_AND_C, signup, login, changeUserType, REO, contract, RE_AD}