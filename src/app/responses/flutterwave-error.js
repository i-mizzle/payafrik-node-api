'use script';

module.exports = (res, error) => {
    let parsedError = null
    try{
        console.log('IN ERROR HANDLER', JSON.parse(error.error))
        if(typeof error.error == "string"){
            parsedError = JSON.parse(error.error)
        } else {
            parsedError = JSON.parse(error.error)
        }
        return res.status(500).send({
            'status': false,
            'name': 'Flutterwave Error',
            'message': parsedError.message,
            'code': parsedError.code,
        });
    }
    catch (e){
        return res.status(500).send({
            'status': false,
            'name': 'Flutterwave Error',
            'message': 'Unable to decode response from flutterwave',
            'flutterwaveResponse': e
        });
    }
};


