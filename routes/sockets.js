const sockets = require("express")();
const http = require("http").Server(sockets);
const io = require("socket.io")(http, {
    cors: {}
});
const port = 3002


sockets.get('/', (req, res) => {
    res.json({
        hallo: "hallo",
        tschuess: "tschüss"
    });
});

io.on("connection", function(socket) {
    socket.on("playing", function(playState) {
       io.emit("newPlaying", playState)
    });
});

http.listen(port, () => {
    console.log('listening on ' + port);
});