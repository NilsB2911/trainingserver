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
router.post('/createRoom', cors(corsSettings), function (req, res) {
    let sessionId = uuidV4()
    let trainingId = req.body.trainingId;
    let query = `INSERT INTO \`sessions\`(\`sessionId\`, \`trainingId\`) VALUES ('${sessionId}','${trainingId}')`
    connection.query(query, (err, queryRes) => {
        if (err) throw res.sendStatus(500);
    })
    res.status(201).json(sessionId)
})


/*
    returns the workout related to the session
 */
router.options("/getCommonWorkout/:sessionId", cors(corsSettings))
router.get("/getCommonWorkout/:sessionId", cors(corsSettings), function (req, res) {
    let sid = req.params.sessionId;
    let query = `SELECT trainingtest.name, trainingtest.json, trainingtest.time, trainingtest.userId, trainingtest.tid 
                 FROM sessions INNER JOIN trainingtest ON trainingtest.tid=sessions.trainingId 
                 WHERE sessionId = '${sid}'`

    console.log(query);
    connection.query(query, (err, result) => {
        if (err) throw res.sendStatus(404);
        res.status(200).json(result[0])
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


module.exports = router;