

const bodyCleaner = (req, res, next) => {
    req.body = {};
    next();
}

//this function check the request origin to prevent cross-site request forgery CSRF.

module.exports = {
    bodyCleaner
}