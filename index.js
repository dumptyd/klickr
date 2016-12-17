"use strict"; //jshint ignore:line
const express = require('express'),
      app = express(),
      port = process.env.PORT || 8080,
      bodyParser = require('body-parser'),
      path = require('path'),
      generateName = require('sillyname'),
      randomId = require('./lib/randomId'),
      rand = require('./lib/rand');
let   io = require('socket.io');

app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));
app.get('/', (req, res) => {
  res.sendFile( path.join(__dirname, 'index.html') );
});


let server = app.listen(port);
console.log(`Listening on ${port}`);
io = io(server);
let clients = [];
let bonusId = [];
let clicks = 0;
let maxClickRate = 12;

io.on('connection', function(socket){
  clients.push({
    id: socket.id,
    name: socket.handshake.query.nameToConnectWith || generateName(),
    multiplier: 1,
    score: 0
  });
  
  //send metadata to everyone on connection or if a new client joins
  io.emit('meta', {totalPlayers: clients.length, players: clients, bonusId: bonusId});
  
  socket.on('disconnect', () => {
    
    // remove client from clients array and send metadata to everyone 
    let index = clients.findIndex(elem => elem.id == socket.id);
    clients.splice(index,1);
    io.emit('meta', {totalPlayers: clients.length, players: clients, bonusId: bonusId});
    
  });
  
  socket.on('multiplierClicked', data => {
    
    //check to see if multiplier bonus with that `id` exists
    //if yes, remove it, update client's multiplier and send 
    //updated stats to the client  
    let index = bonusId.findIndex(elem => elem.bonusId == data.bid);
    if(index!=-1){
      bonusId.splice(index,1);
      io.emit('multiplierClicked', {bid: data.bid});
      let client = clients.find(elem => elem.id == socket.id);
      client.multiplier++;
      socket.emit('stats', {stats: client});
    }
  });
  
  //`data` has {x, y, stats{multiplier, score}}
  socket.on('click', (data) => {
    clicks++;
    
    //find client who clicked on #app, get their `name` and `id`,
    //update score (not multiplier) and send updated stats
    let elem = clients.find(elem => elem.id == socket.id);
    
    //check for cheating
    let oldScore = elem.score;
    let newScore = data.stats.score;
    let scoreDiff = newScore - oldScore;
    let clickRate = (scoreDiff * 2) / elem.multiplier;
    //console.log(oldScore, newScore, clickRate);
    if(clickRate > maxClickRate){
      elem.score = -100;
      socket.emit('stats', {stats: elem});
      io.emit('meta', {totalPlayers: clients.length, players: clients, bonusId: bonusId});
      return;
    }
    let name = elem.name;
    let id = elem.id;
    elem.score = data.stats.score;
    socket.emit('stats', {stats: elem});
    
    //inform everyone (except this client) about the click if the last click was at least 
    //one second before.
    if(data.broadcast){
      socket.broadcast.emit('click', {coords: data, name: name, id:id });
    }
    
    //generate a multiplier bonus on every 10 clicks and emit `multiplier` event
    //multiplier bonus has {bonusId, x, y}. x and y are in percentage form.
    if(clicks%10==0){ //jshint ignore:line
      let bid = randomId(rand(5,20));
      let objToPush = {
        bonusId: bid,
        x: rand(5,95),
        y: rand(5,95)
      };
      bonusId.push(objToPush);
      io.emit('multiplier', objToPush);
    }
    
    //send updated metadata so that the leaderboard positions can be updated.
    io.emit('meta', {totalPlayers: clients.length, players: clients, bonusId: bonusId});
    
  });
  
});