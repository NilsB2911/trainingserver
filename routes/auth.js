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
    credentials: true,
    origin: 'http://localhost:3000',
    optionsSuccessStatus: 200
}

var jwt = require('jsonwebtoken')
const config = require('../config/config.json')

//returns true, if uuid is valid
router.get("/checkIfUidExists/:uid", cors(corsSettings), function (req, res, next) {
    let queryString = "SELECT uid FROM `user` WHERE uid = " + addQuotation(req.params.uid);
    connection.query(queryString, (err, result) => {
        if (err) throw err;
        if (result.length === 0) {
            res.send(false)
        } else {
            res.send(true);
        }
    })
})

router.options("/register", cors(corsSettings));
router.post("/register", cors(corsSettings), function (req, res, next) {
    console.log(req.body);

    let email = req.body.email;
    let uid = uuidv4();
    let name = req.body.name;

    let queryString = "SELECT email FROM `user` WHERE email = " + addQuotation(req.body.email);
    connection.query(queryString, (err, resultOuter) => {
        if (err) throw err;
        if (resultOuter.length === 0) {
            bcrypt.hash(req.body.pw, 10, function (err, hash) {
                if (err) throw err;
                let queryString = "INSERT INTO `user`(`email`, `pw`, `uid`, `name`) VALUES (" + addQuotation(email) + ", " + addQuotation(hash) + ", " + addQuotation(uid) + ", " + addQuotation(name) + ")";
                connection.query(queryString, (err, result) => {
                    if (err) throw err;
                    let token = jwt.sign({email: email, uid: uid, name: name}, config.secretKey)
                    console.log(token)
                    res.cookie('jwt', token, {httpOnly: true})
                    res.json({
                        "token": token
                    })
                })
            });
        } else {
            res.send(null);
        }
    })
});

router.options("/login", cors(corsSettings));
router.post("/login", cors(corsSettings), function (req, res, next) {
    let email = req.body.email;
    let pw = req.body.pw;

    let getHashedPw = "SELECT pw, uid, name, email FROM `user` WHERE email = " + addQuotation(email);
    connection.query(getHashedPw, (err, result) => {
        let hashedCorrect = result[0].pw;
        bcrypt.compare(pw, hashedCorrect, function (err, bcres) {
            if (err) throw err;
            if (bcres) {
                let token = jwt.sign({email: result[0].email, uid: result[0].uid, name: result[0].name}, config.secretKey)
                console.log(token)
                res.cookie('jwt', token, {httpOnly: true})
                res.status(201).json({
                    "token": token
                })
            } else {
                console.log("false")
                res.send(null);
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