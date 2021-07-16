const sockets = require("express")();
const http = require("http").Server(sockets);
const io = require("socket.io")(http, {
    cors: {}
});
const port = 3002

var workoutToDo;
var workoutStep = 0;

sockets.get('/', (req, res) => {
    res.json({
        hallo: "hallo",
        tschuess: "tschüss"
    });
});

io.on("connection", function (socket) {
    var publicRoomId;
    socket.on("joinRoom", (roomId) => {
        socket.join(roomId);
        publicRoomId = roomId;

        //TODO jeder raum das selbe workout, da public declared
        console.log(socket.rooms);
        io.to(publicRoomId).emit("newWorkoutSelected", workoutToDo);
        io.to(publicRoomId).emit("newCurrentStep", workoutStep);
    })

    socket.on("currentStepChanged", function (step) {
        workoutStep = step;
        io.to(publicRoomId).emit("newCurrentStep", step)
    })

    socket.on("workoutSelected", function (workout) {
        workoutToDo = workout;
        io.to(publicRoomId).emit("newWorkoutSelected", workoutToDo)
    })

    socket.on("playing", function (playState) {
        io.to(publicRoomId).emit("newPlaying", playState)
    });
});

http.listen(port, () => {
    console.log('listening on ' + port);
});