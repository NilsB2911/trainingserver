var createError = require('http-errors');
var express = require('express');
var path = require('path');

var indexRouter = require('./routes/index');
var trainingRouter = require('./routes/excersises')
var usersRouter = require('./routes/auth')
var roomsRouter = require('./routes/rooms')

var bodyParser = require("body-parser");
var cookieParser = require('cookie-parser')

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(bodyParser.json())
app.use(cookieParser());

app.use('/', indexRouter);
app.use('/training', trainingRouter);
app.use('/user', usersRouter);
app.use('/rooms', roomsRouter)


app.use(express.static("pbs"))
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
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
