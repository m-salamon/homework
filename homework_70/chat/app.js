var http = require('http');
var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var index = require('./routes/index');
var users = require('./routes/users');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hjs');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', index);
app.use('/users', users);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

let chatters = [];

var server = http.createServer(app);
server.listen(8080);

const socket_io = require('socket.io');
const io = socket_io.listen(server);

// Wait for connection
io.on('connection', socket => {
  console.log('Got a connection');
  let name = '';
  socket.emit('connectMessage', { thanks: 'Thanks for connecting!', chatters: chatters });


 // wait for 'name' events on this connection
  socket.on('name', data => {
    console.log(data);
    name = data;
    chatters.push(name);
    io.sockets.emit('name', data);
    io.sockets.emit('newChatter', data);
  });

  // wait for 'message' events on this connection
  socket.on('message', data => {
    //console.log(data);
    io.sockets.emit('message', name + ' ' +  data);
  });


 //listen for disconnect
  socket.on('disconnect', data => {
    io.sockets.emit('disconnectMessage', name);
  });

});
