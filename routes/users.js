var express = require('express');
var router = express.Router();

const mongojs = require("mongojs");
const db = mongojs('bezeroakdb', ['bezeroak']);

let users = [];

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


router.post("/new", (req, res) => {
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
  user.izena = req.body.izena;
  user.abizena = req.body.abizena;
  user.email = req.body.email;
  
  // update user in mongo
  db.bezeroak.update({_id: mongojs.ObjectId(req.params.id) }, 
    { $set: {izena: req.body.izena, abizena: req.body.abizena, email: req.body.email} }, 
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
