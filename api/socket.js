const socketIO = require('socket.io');
const io = socketIO(1001);
var websocket = null;
io.on('connection', (socket) => {
  websocket=socket;
  console.log('Bir Kullanıcı Bağlandı Socke_ID : '+socket.id);
  socket.send({id:socket.id,data:{},message:"welcome"});

  socket.on('disconnect', () => {
    console.log('Bir Kullanıcı Ayrıldı Socke_ID : '+socket.id);
    socket.send({id:socket.id,data:{},message:"Kapattınız"});
  });

  socket.on('notify',function(data){
    socket.send(data);
  });

});

module.exports = {io:io,socket:websocket};
