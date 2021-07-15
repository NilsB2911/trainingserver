var express = require('express');
var router = express.Router();
var {v4: uuidV4} = require('uuid');

var cors = require('cors')
var corsSettings = {
    origin: 'http://localhost:3000',
    credentials: true,
    optionsSuccessStatus: 200
}

require('dotenv').config()
var mysql = require('mysql');
var connection = mysql.createConnection({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE
})

/*
    creates sessionroom
 */
router.options("/createRoom", cors(corsSettings));
router.post('/createRoom/', cors(corsSettings), function (req, res) {
    let sessionId = uuidV4()
    let trainingId = req.body.trainingId;
    let query = `INSERT INTO \`sessions\`(\`sessionId\`, \`trainingId\`) VALUES ('${sessionId}','${trainingId}')`
    connection.query(query, (err, queryRes) => {
        if (err) throw err;
        console.log(queryRes);
    })
    res.json(sessionId)
})


/*
    returns the workout related to the session
 */
router.options("/getCommonWorkout/:sessionId", cors(corsSettings))
router.get("/getCommonWorkout/:sessionId", cors(corsSettings), function (req, res) {
    let query = `SELECT * FROM \`sessions\` WHERE \`sessionId\` = '${req.params.sessionId}'`
    connection.query(query, (err, result) => {
        if (err) throw err;
        let tid = getJSON(result[0]);
        let innerQuery = `SELECT * FROM \`trainingtest\` WHERE \`tid\` = '${tid.trainingId}'`
        connection.query(innerQuery, (err, innerResult) => {
            if (err) throw err;
            let returnValue = getJSON(innerResult[0]);
            res.json(returnValue);
        })
    })
})

/*
    clears the session
 */
router.options("/clearSession", cors(corsSettings))
router.delete("/clearSession", cors(corsSettings), function (req, res) {
    console.log(req.body);
    let query = `DELETE FROM \`sessions\` WHERE \`sessionId\` = '${req.body.sessionId}' AND \`trainingId\` = '${req.body.trainingId}'`
    connection.query(query, (err, result) => {
        if (err) {
            res.status(500).send("nok");
        }
        //console.log(result);
        res.status(200).send("ok");
    })
})

function getJSON(jsonObject) {
    let jsonReturn = JSON.stringify(jsonObject);
    return JSON.parse(jsonReturn);
}

module.exports = router;