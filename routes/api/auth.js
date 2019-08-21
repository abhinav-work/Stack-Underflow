const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jsonwt = require('jsonwebtoken');
const passport = require('passport');
const key = require('../../setup/myurl');

router.get("/", (req,res,next)=> {
    //res.send("Success");    
    res.json({test: "Auth is being tested"});   
});

const Person = require('../../Models/Person');
router.post("/register", (req, res, next)=>{
   // res.send('Registation Begins...');
    Person.findOne({email: req.body.email})
    .then(person => {
        if(person)
        {
            res.status(400).json({emailerror: "User is already registered"});
        }
        else{
            const newPerson = new Person({
                name: req.body.name,
                email: req.body.email,
                password: req.body.password
            });
            //Encrypting
            bcrypt.genSalt(10, (err, salt) =>{
                bcrypt.hash(newPerson.password, salt, (err, hash)=>{
                    if(err) throw err;
                    newPerson.password = hash;
                    newPerson.save()
                    .then(person => res.json(person))
                    .catch(err => console.log(err))
                })
            })
        }
    })
    .catch(err=> console.log(err));
})
router.post('/login', (req,res,next)=>{
    const email = req.body.email;
    const password = req.body.password;
    Person.findOne({email})
        .then(person =>{
            if(!person)
            {
                return res.status(404).json({emailerror: 'User Not Found'});
            }
        
                bcrypt.compare(password, person.password)
                    .then(isCorrect => {
                        if(!isCorrect)
                        {
                            res.status(400).json({passworderror: 'Password is not correct'})
                        }
                        else{
                            const payload = {
                                id: person.id,
                                name: person.name,
                                email: person.email
                            }
                            jsonwt.sign(
                                payload,
                                key.secret,
                                { expiresIn: 3600 },
                                (err, token) => {
                                    res.json({
                                        success: true,
                                        token: "Bearer " + token
                                    })
                                })
                        }
                    })
                    .catch(err => console.log(err));
         
        })
        .catch(err => console.log(err));

});
router.get(
    '/profile', 
    passport.authenticate("jwt", { session: false }), 
(req, res)=>{
    //console.log(req);
    res.json(
        {
            id: req.user.id,
            email: req.user.email,
            name: req.user.name
        }
    )
});
module.exports = router;