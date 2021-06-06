var express = require('express');
var router = express.Router();
const bcrypt = require('bcrypt');

const {v4: uuidv4} = require('uuid');

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
//returns true, if uuid is valid
router.get("/checkIfUidExists", cors(corsSettings), function (req, res, next) {
    let queryString = "SELECT uid FROM `user` WHERE uid = " + addQuotation(req.body.uid);
    connection.query(queryString, (err, result) => {
        if (err) throw err;
        if (result.length === 0) {
            res.send(false)
        } else {
            res.send(true);
        }
    })
})

router.post("/register/:email/:name/:pw", cors(corsSettings), function (req, res, next) {
    console.log(req);

    let email = req.params.email;
    let uid = uuidv4();
    let name = req.params.name;

    let queryString = "SELECT email FROM `user` WHERE email = " + addQuotation(req.body.email);
    connection.query(queryString, (err, resultOuter) => {
        if (err) throw err;
        if (resultOuter.length === 0) {
            bcrypt.hash(req.params.pw, 10, function (err, hash) {
                if (err) throw err;
                let queryString = "INSERT INTO `user`(`email`, `pw`, `uid`, `name`) VALUES (" + addQuotation(email) + ", " + addQuotation(hash) + ", " + addQuotation(uid) + ", " + addQuotation(name) + ")";
                connection.query(queryString, (err, result) => {
                    if (err) throw err;
                    console.log(email, uid, name);
                    res.json({
                        "email": email,
                        "uid": uid,
                        "name": name
                    })
                })
            });
        } else {
            res.send(false);
        }
    })
});

router.get("/login/:email/:pw", cors(corsSettings), function (req, res, next) {
    let email = req.params.email;
    let pw = req.params.pw;

    let getHashedPw = "SELECT pw, uid, name, email FROM `user` WHERE email = " + addQuotation(email);
    connection.query(getHashedPw, (err, result) => {
        let hashedCorrect = result[0].pw;
        bcrypt.compare(pw, hashedCorrect, function (err, bcres) {
            if (err) throw err;
            if (bcres) {
                console.log("correct")
                res.json({
                    "email": result[0].email,
                    "uid": result[0].uid,
                    "name": result[0].name
                })
            } else {
                console.log("false")
                res.send(false);
            }

        })
    })
})

function getJSON(jsonObject) {
    let jsonReturn = JSON.stringify(jsonObject);
    return JSON.parse(jsonReturn);
}

function addQuotation(str) {
    return "'" + str + "'";
}

module.exports = router;