const bcrypt= require('bcrypt')
const jwt= require('jsonwebtoken')


const express= require('express');
const router= express.Router()
const userModel= require('../models/users_model')

router.route('/register')
.post(async (req, res)=>{
    if(! req.body.email){
        res.send('You must sign up with email')
    }
    if(! req.body.password){
        res.send('You must sign up with password')
    }
    const user= await userModel.find({email: req.body.email})
    if(user.length>0){
        res.send('This email is already signed up')
    }
    const salt= await bcrypt.genSalt(10)
    req.body.password = await bcrypt.hash(req.body.password, salt) 
    const newUser= await userModel(req.body).save()
    res.send(newUser)
})

router.route('/login')
.post(async (req, res)=>{
    const user= await userModel.findOne({email : req.body.email})
    if(user == null){
        return res.send('You must sign up first')
    }
    const correctpassword= await bcrypt.compare(req.body.password, user.password)

    if(!correctpassword){
        return res.status(400).send('Invalid Password')
    }
    const token= jwt.sign({_id: user._id,
    role: user.role}, process.env.TOKEN_SECRET)
    res.header('auth-token', token).send(token)
})

module.exports= router