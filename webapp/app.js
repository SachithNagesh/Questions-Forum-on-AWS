var createError = require('http-errors');
var express = require('express');
var bodyParser = require('body-parser');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const fileUpload = require('express-fileupload');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var questionsRouter = require ('./routes/questions');

const cors = require('cors');
var passport = require('passport');
const cloudwatchLogger = require("./config/winston");

var app = express();

// view engine setup
// app.set('views', path.join(__dirname, 'views'));
// app.set('view engine', 'jade');

console.log('Starting Application')
cloudwatchLogger.info('Starting Application')

app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  res.header("Access-Control-Allow-Methods", "GET, POST, OPTIONS, PUT, DELETE");
  next();
});

app.use(cors());
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(fileUpload());
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/v1/user', usersRouter);
app.use('/v1/', questionsRouter);


// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500).set('Content-Type','application/json').send({ "Message ": err.message});
});

module.exports = app;
