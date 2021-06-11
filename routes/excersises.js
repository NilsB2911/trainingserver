var express = require('express');
var router = express.Router();

var mysql = require('mysql');
var connection = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "",
    database: "training"
})

var cors = require('cors')
var corsSettings = {
    origin: 'http://localhost:3000',
    optionsSuccessStatus: 200
}


router.get('/get/:userId', cors(corsSettings), function (req, res, next) {

    let id = req.params.userId;
    let query = "SELECT * FROM `trainingtest` WHERE userId = " + addQuotation(id);

    connection.query(query, (err, result) => {
        if (err) throw err;

        let resultAsJSON = getJSON(result);
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

router.options("/submit", cors(corsSettings));
router.post("/submit", cors(corsSettings), function (req, res, next) {

    let name = req.body.name;
    let json = req.body.json;
    let duration = req.body.duration;
    let userId = req.body.userId;

    let query = "INSERT INTO `trainingtest` (`name`, `json`, `time`, `userId`) VALUES (" + addQuotation(name) + "," + addQuotation(json) + "," + duration + "," + addQuotation(userId) + ")";
    connection.query(query, (err, result) => {
        if (err) throw err;
        res.send(true);
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
