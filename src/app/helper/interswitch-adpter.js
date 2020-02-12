const crypto = require("crypto");
const jsSHA = require("jssha");
const appFunctions = require("./helpers");
const config = require("config");

optionsCheck = options => {
  if (!options) {
    throw "No option  parameter specified";
    return false;
  }
  if (!options.accessToken) {
    if (!options.clientId) {
      throw "No clientId Specified";
    }
    if (!options.secret) {
      throw "No secret specified";
      return false;
    }
  }

  if (!options.url) {
    throw "No endpoint url";
    return false;
  }
  return true;
};

getHeaders = cryptOptions => {
  cryptOptions.clientId = config.interswitch.INTERSWITCH_CLIENT_ID;
  cryptOptions.secret =  config.interswitch.INTERSWITCH_SECRET;
  var signed = getSignature(cryptOptions);

  var contentType = cryptOptions.contentType || "application/json";
  var headers = {
    Authorization: cryptOptions.accessToken ? `Bearer ${cryptOptions.accessToken}` : `InterswitchAuth ${appFunctions.getBase64(appFunctions._encodeUrl(cryptOptions.clientId))}`,
    Timestamp: signed.timeStamp,
    Nonce: signed.nonce,
    Signature: signed.hash,
    SignatureMethod: signed.encryptedMethod,
    "Content-Type": contentType
  };
  return headers;
};

getSignature = function(options) {
  //console.log(options);
  if (!optionsCheck(options)) return false;
  var url = appFunctions._encodeUrl(options.url.replace("http://", "https://"));
  var secret = options.secret ? options.secret : "";
  var clientId = options.clientId ? options.clientId : "";
  var accessToken = options.accessToken ? options.accessToken : "";
  var method = options.method;
  var terminalId = options.terminalId;
  var timeStamp = parseInt(
    Date.now()
      .toString()
      .substr(0, 10)
  );
  var nonce = appFunctions.generateUUID();
  var encryptedMethod = options.encryptionMethod || "SHA-512";
  //   var extraData = options.extraData ? h.encodeExtraData(options.extraData) : "";
  var extraData = options.extraData ? appFunctions.encodeExtraData(options.extraData) : "";
  var baseStringToBeSigned = method + "&" + url + "&" + timeStamp + "&" + nonce + "&" + clientId + "&" + secret;
  if (extraData) {
    encryptedMethod = +"&" + extraData;
  }
  var shaObj = new jsSHA(encryptedMethod, "TEXT"); // sha;
  shaObj.update(baseStringToBeSigned);
  var hash = shaObj.getHash("B64");

  let vals = {
    hash,
    url,
    secret,
    clientId,
    accessToken,
    method,
    url,
    terminalId,
    timeStamp,
    nonce,
    encryptedMethod,
    extraData
  };

  return vals;
};

parseResponse = data => {
  try {
    data = JSON.parse(data);
  } catch (error) {}

  return data;
};

module.exports = {
  getHeaders: getHeaders,
  parseResponse: parseResponse
};
