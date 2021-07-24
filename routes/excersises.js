var express = require('express');
var router = express.Router();

require('dotenv').config()
var mysql = require('mysql');
var connection = mysql.createConnection({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE
})

var cors = require('cors')
var corsSettings = {
    origin: 'http://localhost:3000',
    optionsSuccessStatus: 200
}

const {v4: uuidv4} = require('uuid');

router.use(cors(corsSettings))

/*
    get all workouts from a specific user
    returns all workouts
 */
router.get('/get/:userId', function (req, res, next) {

    let id = req.params.userId;
    let query = `SELECT * FROM \`trainingtest\` WHERE \`userId\` = '${id}'`

    connection.query(query, (err, result) => {
        if (err) throw res.sendStatus(404);

        let resultAsJSON = getJSON(result);
        res.status(200).json(resultAsJSON);
    })
});

/*
    get workout to populate edit page
    returns specific workout
 */
router.get("/edit/:tid/:uid", function (req, res, next) {
    let tid = req.params.tid;
    let uid = req.params.uid;

    let query = `SELECT * FROM \`trainingtest\` WHERE  \`tid\` = '${tid}' AND \`userId\` = '${uid}'`
    console.log(query);
    connection.query(query, (err, result) => {
        if (err) throw res.sendStatus(404);

        let resultAsJSON = getJSON(result);
        res.status(200).json(resultAsJSON);
    })
})

/*
    updates existing workout
    returns true if updated successfully
 */
//router.options("/update", cors(corsSettings))
router.put("/update", function (req, res, next) {

    let name = req.body.name;
    let json = req.body.json;
    let duration = req.body.duration;
    let uid = req.body.userId;
    let tid = req.body.tid;

    let query = `UPDATE \`trainingtest\` SET \`name\`='${name}',\`json\`='${json}', \`time\`='${duration}',\`userId\`='${uid}',\`tid\`='${tid}' WHERE \`tid\` = '${tid}' AND \`userId\` = '${uid}'`
    connection.query(query, (err, result) => {
        if (err) throw res.sendStatus(404);
        res.sendStatus(204);
    })
})

/*
    creates new workout
    returns true if created successfully
 */
//router.options("/submit", cors(corsSettings));
router.post("/submit", function (req, res, next) {

    let name = req.body.name;
    let json = req.body.json;
    let duration = req.body.duration;
    let userId = req.body.userId;
    let tid = uuidv4();

    let query = `INSERT INTO \`trainingtest\` (\`name\`, \`json\`, \`time\`, \`userId\`, \`tid\`) VALUES ('${name}', '${json}', '${duration}', '${userId}', '${tid}')`;
    connection.query(query, (err, result) => {
        if (err) throw res.sendStatus(500);
        res.sendStatus(201);
    })
});

/*
    deletes existing workout
    returns all remaining workouts
 */
//router.options("/deleteWorkout", cors(corsSettings));
router.delete("/deleteWorkout", function (req, res, next) {
    let query = `DELETE FROM \`trainingtest\` WHERE \`tid\` = '${req.body.tid}' AND \`userId\` = '${req.body.uid}'`
    connection.query(query, (err, resultIrrelevant) => {
        if (err) throw res.status(409);
        res.sendStatus(204)
    })
})

function getJSON(jsonObject) {
    let jsonReturn = JSON.stringify(jsonObject);
    return JSON.parse(jsonReturn);
}

module.exports = router;
