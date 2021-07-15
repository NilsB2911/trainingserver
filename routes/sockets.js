const sockets = require("express")();
const http = require("http").Server(sockets);
const io = require("socket.io")(http, {
    cors: {}
});
const port = 3002

let workoutToDo;
let workoutStep = 0;

sockets.get('/', (req, res) => {
    res.json({
        hallo: "hallo",
        tschuess: "tschüss"
    });
});

io.on("connection", function (socket) {
    socket.join("lol")
    socket.emit("newWorkoutSelected", workoutToDo, () => {
        socket.emit("newCurrentStep", workoutStep)
    })

    //TODO submit not working
    socket.on("currentStepChanged", function (step) {
        workoutStep = step;
        socket.emit("newCurrentStep", workoutStep)
    })

    socket.on("workoutSelected", function (workout) {
        workoutToDo = workout;
        socket.emit("newWorkoutSelected", workoutToDo)
    })
    socket.on("playing", function (playState) {
        io.to("lol").emit("newPlaying", playState)
    });
});

http.listen(port, () => {
    console.log('listening on ' + port);
});