'use strict';
const ok = require('./ok');
const error = require('./error');
const unAuthorize = require('./unAuthorize');
const created = require('./created');
const conflict = require('./conflict');
const interswitchError = require('./interswitch-error');
const badRequest = require('./bad-request');
const notFound = require('./not-found');

module.exports = { ok, error, unAuthorize, created , conflict, interswitchError, badRequest, notFound };
