exports.DATABASE_URL = process.env.DATABASE_URL ||
global.DATABASE_URL ||
'mongodb://localhost/bitalert-web-server';

exports.TEST_DATABASE_URL = (
process.env.TEST_DATABASE_URL ||
'mongodb://localhost/bitalert-web-server');

exports.PORT = process.env.PORT || 8080;

exports.CODE = process.env.CODE;

exports.ACCOUNT_SID = process.env.ACCOUNT_SID;

exports.AUTH_TOKEN = process.env.AUTH_TOKEN;

exports.SECRET = process.env.SECRET || 'keyboard cat';

exports.CLIENT_ORIGIN = process.env.CLIENT_ORIGIN || 'http://localhost:3000';
