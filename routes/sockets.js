const sockets = require("express")();
const http = require("http").Server(sockets);
const io = require("socket.io")(http, {
    cors: {}
});
const port = 3002
const fetch = require('node-fetch');

//TODO dynamische methode zum wechseln der steps

io.on("connection", function (socket) {
    var publicRoomId;
    socket.on("joinRoom", async (roomId) => {
        socket.join(roomId);
        publicRoomId = roomId;
        console.log("JOINED " + socket.id)

        await fetch(`http://localhost:3001/rooms/getCommonWorkout/${publicRoomId}`, {
            method: "get",
            headers: {
                "Content-Type": "application/json",
            },
            credentials: "include"
        }).then(res => res.json()).then(finWo => {
            console.log(finWo)
            io.to(publicRoomId).emit("newWorkoutSelected", finWo);
            //io.to(publicRoomId).emit("newCurrentStep", workoutStep);
        })
    })
    socket.on("disconnect", (reason) => {
        console.log(reason);
    })

    socket.on("currentStepChanged", function (step) {
        io.to(publicRoomId).emit("newCurrentStep", step)
    })

    socket.on("playing", function (playState) {
        io.to(publicRoomId).emit("newPlaying", playState)
    });
});

http.listen(port, () => {
    console.log('listening on ' + port);
});