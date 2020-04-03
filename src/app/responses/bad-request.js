module.exports = (res, error) => {
    return res.status(400).send({
        'status': false,
        'message': error.message,
        'stack': error.stack
    });
};
