const nanoGenerate = require("nanoid/generate");
const dictionary = require("nanoid-dictionary");
const allowableStrings = dictionary.numbers + dictionary.lowercase + dictionary.uppercase;
const Buffer = require("buffer/").Buffer;
const jsSHA = require("jssha");
const uuid = require("uuid/v1");
const keySanitizer = require("keys-to-camelcase");

/**
 * Generates a random uniquie token with base 36 and a specified length
 */
var getToken = length => {
  return nanoGenerate(allowableStrings, length).toUpperCase();
};

getNonce = length => {
  return nanoGenerate(allowableStrings, length);
};

/**
 * Generates a random uniquie token with base 36 and a specified length
 */
var getAuthToken = length => {
  return nanoGenerate(allowableStrings, length).toUpperCase();
};

var getTicketNumber = length => {
  return nanoGenerate(allowableStrings, length).toUpperCase();
};

var _encodeUrl = function(url) {
  return encodeURIComponent(url);
};

// Base 64
var getBase64 = function(str) {
  return new Buffer(str).toString("base64");
};

var getPassportHeader = function(clientid, secret) {
  return getBase64(clientid + ":" + secret);
};

var encodeExtraData = function(extraData) {
  var encoded = "";
  for (var i = 0, lens = extraData.length; i < lens; i++) {
    encoded += _encodeUrl(extraData[i]) + "&";
  }
  return (encoded = encoded.substr(0, encoded));
};

var generateNameSpaceUUID = function() {
  return uuid();
};

// GUID Generate a unique ID
var generateUUID = function() {
  var d = new Date().getTime();
  var uuid = "xxxxxxxxxxxx4xxxyxxxxxxxxxxxxxxx".replace(/[xy]/g, function(c) {
    var r = (d + Math.random() * 16) % 16 | 0;
    d = Math.floor(d / 16);
    return (c == "x" ? r : (r & 0x3) | 0x8).toString(16);
  });
  return uuid;
};

/**
 * Generates unique code
 */
getUniqueId = uppercase => {
  if (uppercase) {
    return uniqid().toUpperCase();
  } else {
    return uniqid();
  }
};

getEpochTimeStamp = () => {
  return Math.floor(new Date() / 1000);
};

/**
 * Generates unique code with prefix
 */
getUniqueIdWithPrefix = (prefix, uppercase) => {
  if (uppercase) {
    return uniqid(prefix).toUpperCase();
  } else {
    return uniqid(prefix);
  }
};

slugify = string => {
  return string
    .toString()
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^\w\-]+/g, "")
    .replace(/\-\-+/g, "-")
    .replace(/^-+/, "")
    .replace(/-+$/, "");
};

errorResponse = message => {
  return {
    success: false,
    error: message
  };
};

messageResponse = message => {
  return {
    success: true,
    message: message
  };
};

dataResponse = (message, data) => {
  return {
    success: true,
    message: message,
    data: data
  };
};

isInArray = (value, array) => {
  if (Array.isArray(array)) {
    return array.includes(value);
  } else {
    return false;
  }
};

function isValidEmail(email) {
  const valid = new RegExp(/^[^@\s]+@[^@\s]+\.[^@\s]+$/);
  return valid.test(email);
}
function isValidPhoneNumber(phone) {
  const valid = RegExp(/^\d{4}\d{3}\d{4}$/);
  return valid.test(phone);
}

function requiredParam(param) {
  throw new RequiredParameterError(param);
}

function upperFirst(word) {
  if (word.length === 1) {
    return word.toUpperCase();
  }
  return word.charAt(0).toUpperCase() + word.substring(1);
}

function adaptRequest(req = {}) {
  return Object.freeze({
    path: req.path,
    method: req.method,
    pathParams: req.params,
    queryParams: req.query,
    body: req.body,
    user: req.user || {}
  });
}

function getDateStringFromTime(time) {
  let currentDate = new Date(time);
  return currentDate.getDate() + "-" + (currentDate.getMonth() + 1) + "-" + currentDate.getFullYear();
}

validatePhoneNumber = phoneString => {
  if (!isValidPhoneNumber(phoneString)) {
    throw new Error("Invalid phone number");
  }
};

validateEmailString = emailString => {
  console.log(emailString);

  if (!isValidEmail(emailString)) {
    throw new Error("Invalid email address");
  }
};

validateNameString = (label, nameString) => {
  if (nameString.length < 2) {
    throw new Error(`${label} must be at least 2 characters long.`);
  }
};

validateFullNameString = (label, nameString) => {
  if (nameString.length < 2) {
    throw new Error(`${label} must be at least 2 characters long.`);
  }
};

validateRequiredProperty = (label, objectString) => {
  if (objectString == null || objectString == undefined || objectString == "undefined") {
    throw new Error(`${label} must be provided.`);
  }
};

validateRequiredStringProperty = (label, objectString) => {
  if (objectString == null || objectString == undefined || objectString == "undefined") {
    throw new Error(`${label} must be provided.`);
  }
  if (typeof objectString != "string") {
    throw new Error(`${label} has an invalid data type.`);
  }
};

validateRequiredNumericProperty = (label, objectString) => {
  objectString = +objectString;
  if (objectString == null || objectString == undefined || objectString == "undefined") {
    throw new Error(`${label} must be provided.`);
  }
  if (typeof objectString != "number") {
    throw new Error(`${label} has an invalid data type.`);
  }
};

module.exports = {
  keySanitizer: keySanitizer,
  getToken: getToken,
  getAuthToken: getAuthToken,
  getNonce: getNonce,
  getUniqueId: getUniqueId,
  getUniqueIdWithPrefix: getUniqueIdWithPrefix,
  messageResponse: messageResponse,
  errorResponse: errorResponse,
  dataResponse: dataResponse,
  isInArray: isInArray,
  getTicketNumber: getTicketNumber,
  getEpochTimeStamp: getEpochTimeStamp,
  isValidEmail: isValidEmail,
  isValidPhoneNumber: isValidPhoneNumber,
  requiredParam: requiredParam,
  upperFirst: upperFirst,
  adaptRequest: adaptRequest,
  getDateStringFromTime: getDateStringFromTime,
  validatePhoneNumber: validatePhoneNumber,
  validateEmailString: validateEmailString,
  validateFullNameString: validateFullNameString,
  validateNameString: validateNameString,
  validateRequiredProperty: validateRequiredProperty,
  validateRequiredStringProperty: validateRequiredStringProperty,
  validateRequiredNumericProperty: validateRequiredNumericProperty,
  _encodeUrl: _encodeUrl,
  getPassportHeader: getPassportHeader,
  encodeExtraData: encodeExtraData,
  generateUUID: generateUUID,
  getBase64: getBase64,
  slugify: slugify,
  generateNameSpaceUUID: generateNameSpaceUUID
};
