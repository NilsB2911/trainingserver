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

        await fetch(`http://localhost:3001/rooms/getCommonWorkout/${publicRoomId}`, {
            method: "get",
            headers: {
                "Content-Type": "application/json",
            },
            credentials: "include"
        }).then(res => {
            if (res.status === 200) {
                res.json().then(finWo => {
                    io.to(publicRoomId).emit("newWorkoutSelected", finWo);
                })
            } else if (res.status === 404) {
                console.log("workout not found")
            }
        })
    })

    socket.on("joinWithName", (userObj) => {

        socket.nickname = userObj.name;
        socket.pb = userObj.pb

        /*
            get all Ids from room
         */
        let users = io.sockets.adapter.rooms.get(publicRoomId);
        let userArray = Array.from(users);

        let allUserNames = [];

        /*
            get socket with id from userArray
         */
        for (let i = 0; i < userArray.length; i++) {
            allUserNames.push({
                nickname: io.sockets.sockets.get(userArray[i]).nickname,
                userId: userArray[i],
                pb: io.sockets.sockets.get(userArray[i]).pb
            });
        }

        io.to(publicRoomId).emit("newUsernames", allUserNames);
    })

    socket.on("disconnect", (reason) => {
        io.to(publicRoomId).emit("userDisconnected", socket.id);
    })

    socket.on("currentStepChanged", function (step) {
        io.to(publicRoomId).emit("newCurrentStep", step)
    })

    socket.on("playing", function (playState) {
        io.to(publicRoomId).emit("newPlaying", playState)
    });

    socket.on("newMsg", (msgObject) => {
        io.to(publicRoomId).emit("newMsgToAppend", msgObject)
    })
});

http.listen(port, () => {
    console.log('listening on ' + port);
});