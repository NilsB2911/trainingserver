var express = require('express');
var router = express.Router();

var mysql = require('mysql');
var connection = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "",
    database: "training"
})

let resultString = "";

var cors = require('cors')
var corsSettings = {
    origin: 'http://localhost:3000',
    optionsSuccessStatus: 200
}


router.get('/get/:userId', cors(corsSettings), function (req, res, next) {

    let id = req.params.userId;
    let query = "SELECT * FROM `trainingtest` WHERE userId = " + addQuotation(id);
    console.log(query);

    connection.query(query, (err, result) => {
        if (err) throw err;

        let resultAsJSON = getJSON(result);
        console.log(resultAsJSON);
        res.json(resultAsJSON);
    })
});

router.get("/get/:userId/:workoutName", cors(corsSettings), function (req, res, next) {
    let id = req.params.userId;
    let workoutName = req.params.workoutName;

    let query = "SELECT * FROM `trainingtest` WHERE userId = " + addQuotation(id) + " AND name = " + addQuotation(workoutName);
    connection.query(query, (err, result) => {
        if (err) throw err;

        let resultAsJSON = getJSON(result);
        res.json(resultAsJSON);
    })
})

router.post("/submit/:name/:json/:duration/:userId", cors(corsSettings), function (req, res, next) {

    let name = req.params.name;
    let json = req.params.json;
    let duration = req.params.duration;
    let userId = req.params.userId;

    let response = undefined;

    let query = "INSERT INTO `trainingtest` (`name`, `json`, `time`, `userId`) VALUES (" + addQuotation(name) + "," + addQuotation(json) + "," + duration + "," + addQuotation(userId) + ")";
    connection.query(query, (err, res) => {
        if (err) throw err;
        console.log(res);
    })
});


function getJSON(jsonObject) {
    let jsonReturn = JSON.stringify(jsonObject);
    return JSON.parse(jsonReturn);
}

function addQuotation(str) {
    return "'" + str + "'";
}

module.exports = router;
