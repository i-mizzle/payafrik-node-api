'use script';

module.exports = (res, error) => {
    let parsedError = null
    try{
        if(typeof error.message == "string"){
            parsedError = JSON.parse(error.error)
        } else {
            parsedError = JSON.parse(error.error)
        }
        return res.status(500).send({
            'status': false,
            'name': 'Interswitch Error',
            'message': parsedError.error.message,
            'code': parsedError.error.code,
            'responseCodeGrouping': parsedError.error.responseCodeGrouping
        });
    }
    catch (e){
        return res.status(500).send({
            'status': false,
            'name': 'Interswitch Error',
            'message': 'Unable to decode response from interswitch',
            'interswitchResponse': e
        });
    }
};


