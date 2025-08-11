

const bodyCleaner = (req, res, next) => {
    req.body = {};
    next();
}


module.exports = {
    bodyCleaner
}