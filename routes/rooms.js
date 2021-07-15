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

router.options("/createRoom", cors(corsSettings));
router.post('/createRoom', cors(corsSettings), function (req, res) {
    let sessionId = uuidV4()
    let trainingId = req.body.trainingId;
    let query = `INSERT INTO \`sessions\`(\`sessionId\`, \`trainingId\`) VALUES ('${sessionId}','${trainingId}')`
    connection.query(query, (err, queryRes) => {
        if (err) throw err;
        console.log(queryRes);
    })
    res.json(sessionId)
})

module.exports = router;