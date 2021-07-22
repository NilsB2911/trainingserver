var express = require('express');
var router = express.Router();
const bcrypt = require('bcrypt');

const {v4: uuidv4} = require('uuid');

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
    credentials: true,
    origin: 'http://localhost:3000',
    optionsSuccessStatus: 200
}

var jwt = require('jsonwebtoken')
const config = require('../config/config.json')


var multer = require("multer");
var multerStorage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, './pbs')
    },
    filename: function (req, file, cb) {
        let extensionArray = file.mimetype.split("/")
        let extension = extensionArray[extensionArray.length - 1]
        cb(null, uuidv4() + "." + extension);
    }
})
var upload = multer({storage: multerStorage})

router.use(cors(corsSettings))
/*
    checks id uuid exists
    returns true/false corresponding

router.get("/checkIfUidExists/:uid", function (req, res, next) {
    let queryString = "SELECT uid FROM `user` WHERE uid = " + addQuotation(req.params.uid);
    connection.query(queryString, (err, result) => {
        if (err) throw err;
        if (result.length === 0) {
            res.send(false)
        } else {
            res.send(true);
        }
    })
})*/

/*
    registers new user
    returns user object and jwt cookie
 */
//router.options("/register", cors(corsSettings));

router.post("/register", upload.single("pb"), function (req, res, next) {

    let email = req.body.email;
    let uid = uuidv4();
    let name = req.body.name;
    let pbLink

    if (req.file) {
        pbLink = req.file.filename
    } else {
        pbLink = null
    }


    let queryString = `SELECT \`email\` FROM \`user\` WHERE \`email\` = '${email}'`;
    connection.query(queryString, (err, resultOuter) => {
        if (err) throw err;
        if (resultOuter.length === 0) {
            bcrypt.hash(req.body.pw, 10, function (err, hash) {
                if (err) throw err;
                let queryString = `INSERT INTO \`user\`(\`email\`, \`pw\`, \`uid\`, \`name\`, \`pblink\`) VALUES ('${email}', '${hash}', '${uid}', '${name}', '${pbLink}')`
                connection.query(queryString, (err, result) => {
                    if (err) throw err;
                    let token = jwt.sign({email: email, uid: uid, name: name}, config.secretKey)
                    res.cookie('jwt', token, {httpOnly: true})
                    res.status(200).json({
                        uid: uid,
                        email: email,
                        name: name,
                    })
                })
            });
        } else {
            res.status(401).send(null);
        }
    })
});

/*
    logs user in
    returns user object and jwt cookie
 */
//router.options("/login", cors(corsSettings));
router.post("/login", function (req, res, next) {
    let email = req.body.email;
    let pw = req.body.pw;

    let getHashedPw = `SELECT \`pw\`, \`uid\`, \`name\`, \`email\` FROM \`user\` WHERE \`email\` = '${email}'`;
    connection.query(getHashedPw, (err, result) => {
        if (result.length > 0) {
            let hashedCorrect = result[0].pw;
            bcrypt.compare(pw, hashedCorrect, function (err, bcres) {
                if (err) throw err;
                if (bcres) {
                    let token = jwt.sign({
                        email: result[0].email,
                        uid: result[0].uid,
                        name: result[0].name
                    }, config.secretKey)
                    console.log(token)
                    res.cookie('jwt', token, {httpOnly: true})
                    res.status(200).json({
                        uid: result[0].uid,
                        email: result[0].email,
                        name: result[0].name
                    });
                } else {
                    console.log("false")
                    res.status(401).send(null);
                }

            })
        } else {
            res.status(401).send(null);
        }
    })
})

/*
    logs user in based on jwt token
    returns user object
 */
router.post("/tokenLogin", function (req, res, next) {
    let jwToken = req.cookies.jwt;
    if (jwToken) {
        jwt.verify(jwToken, config.secretKey, (err, decoded) => {
            if (err) throw res.status(403).json({
                uid: null,
                name: null,
                email: null
            })
            res.status(200).json({
                uid: decoded.uid,
                email: decoded.email,
                name: decoded.name
            });
        })
    } else {
        res.status(403).json({
            uid: null,
            name: null,
            email: null
        })
    }
})

/*
    logs user out
    returns jwt cookie clear
 */
//router.options("/logout", cors(corsSettings))
router.post("/logout", function (req, res, next) {
    res.clearCookie("jwt");
    res.status(200).json({
        uid: null,
        email: null,
        name: null
    });
})

/*
    returns user profile picture
 */
var path = require("path")
router.get("/pb/:uid", function (req, res, next) {
    let queryString = `SELECT \`pblink\` FROM \`user\` WHERE \`uid\` = '${req.params.uid}'`
    connection.query(queryString, (err, result) => {
        if (err) throw err;
        if (result[0].pblink) {
            res.status(200).json({
                link: `http://localhost:3001/${result[0].pblink}`
            });
        } else {
            res.status(200).json({
                link: "http://localhost:3001/dummyPb.png"
            });
        }
    })
})


module.exports = router;