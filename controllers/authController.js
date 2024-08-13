const userModel = require("../models/user-model");
const bcrypt = require("bcrypt");
const jwt = require('jsonwebtoken')
const {generateToken} = require('../utils/generateToken')

module.exports.registerUser = async function (req, res) {
  try {
    let { fullname, password, email } = req.body;

    let user = await userModel.findOne({email:email})
    if(user) return res.status(401).send("You already have an account, please login.")

    bcrypt.genSalt(10, function (err, salt) {
      bcrypt.hash(password, salt, async function (err, hash) {
        if (err) return res.send(err.message);
        else {
          //save to db
          let user = await userModel.create({
            email,
            password:hash,
            fullname,
          });

          //token based.
          let token = generateToken(user)
          res.cookie('token',token)

          res.status(201).send(user);
        }
      });
    });
  } catch (error) {
    res.send(error.message);
  }
}


module.exports.loginUser = async function(req,res){
  try {
    let {email,password} = req.body;

  let user = await userModel.findOne({email:email});
  if(!user) return res.status(401).send("Email or Password is incorrect")

  bcrypt.compare(password,user.password , function(err,result){
    if(result){
      let token = generateToken(user)
      res.cookie('token',token)
      res.send('you can login')
    }
    else{
      res.send('Email or Password is incorrect.')
    }
  })

  } catch (error) {
    
  }
}

module.exports.logout = function(req,res){
  res.cookie('token','');
  res.redirect('/')
}