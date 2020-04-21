const requestPromise = require("request-promise");
const response = require('./../app/responses');
module.exports = async ( req, res, next ) => {
    const pfkUserToken = req.headers['pfk-user-token']
    let url = `https://api.payafrik.io/auth/user/profile/`;
    let verb = "GET";
    let userResponse = null;
  
    let requestHeaders = {
      Authorization: pfkUserToken,
      "Content-Type": "application/json"
    };
  
    let requestOptions = { uri: url, method: verb, headers: requestHeaders};
    try {
        userResponse = await requestPromise(requestOptions);
        const user = JSON.parse(userResponse)
        req.user = {
            id: user.id,
            username: user.username,
            tokenBalance: user.balance
        }
        next();
    } catch (error) {
      console.log(error.message);
      return response.badRequest(res, {message: error.message})
    }
  };