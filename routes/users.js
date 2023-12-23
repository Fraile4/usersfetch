var express = require('express');
var router = express.Router();

const mongojs = require("mongojs");
const db = mongojs('bezeroakdb', ['bezeroak']);

// multer
const multer = require("multer");

const path = require('path');
const bidea = path.join(__dirname, '../public/uploads');

let users = [];

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, bidea); // Fitxategiak gordetzeko karpeta
  },
  filename: function (req, file, cb) {
    // Fitxategiaren izena: "file.originalname-<timestamp>-<random>.<extension>"
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const nameAndExtension = file.originalname.split('.'); // Fitxategiaren luzapena mantentzeko
    cb(null, nameAndExtension[0] + '-' + uniqueSuffix + '.' + nameAndExtension[1]);
  }
});
const limits = {filesize: 2 * 1024 * 1024} // 2MB

const upload = multer({ storage: storage, limits: limits})

// get users from mongo
db.bezeroak.find((err, docs) => {
  if (err) {
    console.log("Error: " + err);
  } else {
    users = docs;
  } 
});

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.render("users", {
    title: "Users", 
    users: users
  });
});

router.get('/list', function(req, res, next) {
  res.json(users)
  });


router.post("/new", upload.single('avatar') , (req, res) => {
  console.log(req.file);

  if (req.file)
    req.body.avatar = req.file.filename;
  else
    req.body.avatar = "NoImageAvaliable.jpeg";

  users.push(req.body);
  // insert new user in mongo
  db.bezeroak.insert(req.body, (err, user) => {
    if (err) {
      console.log("Error: " + err);
      res.send(err);
    } else{
      console.log(user);
      res.json(user);
    }
  });
});

router.delete("/delete/:id", (req, res) => {
  
  users = users.filter(user => user._id != req.params.id);
  // remove user from mongo
  db.bezeroak.remove({_id: mongojs.ObjectId(req.params.id)}, (err, user) => {
    if (err) {
      console.log("Error: " + err);
    } else{
      console.log(user);
    }
  });
  res.json(users);  
});

router.put("/update/:id", (req, res) => {
  let user = users.find(user => user._id == req.params.id);
  user.avatar = req.file.filename;
  user.izena = req.body.izena;
  user.abizena = req.body.abizena;
  user.email = req.body.email;
  
  // update user in mongo
  db.bezeroak.update({_id: mongojs.ObjectId(req.params.id) }, 
    { $set: {avatar:req.file.filename, izena: req.body.izena, abizena: req.body.abizena, email: req.body.email} }, 
    function (err, user) {
      if (err) {
        console.log("Error: " + err);
      } else {
        console.log(user);
      }
    });
  res.json(users);
});

module.exports = router;
