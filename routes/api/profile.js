const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const passport = require('passport');

const Person = require('../../Models/Person');
const Profile = require('../../Models/Profile');

mongoose.set('useFindAndModify', false);
router.get(
    "/user-profile", 
    passport.authenticate("jwt", { session: false }), 
    (req, res)=>{
        Profile.findOne({user: req.user.id})
        .then(profile => {
            
            if(!profile)
            {   
                    return res.status(400).json({ profilenotfound: "No Profile Found" });
            }
            else if(profile)
            {
                res.json(profile);
            }
            
        })
        .catch(err => console.log('Error in finding the profile' + err));
    });

router.post(
    "/user-profile",
    passport.authenticate('jwt',{ session: false }),
    (req, res) => {
        profileValues = {};
        profileValues.id = req.user.id;
        console.log("In Profile " + profileValues.id);
        if(req.body.username) profileValues.username = req.body.username;
        if (req.body.website) profileValues.website = req.body.website;
        if (req.body.country) profileValues.country = req.body.country;
        if (typeof req.body.languages != undefined) {
            profileValues.languages = req.body.languages.split(',');
        }
        if (req.body.portfolio) profileValues.portfolio = req.body.portfolio;
        profileValues.social = {};
        if (req.body.instagram) profileValues.social.instagram = req.body.instagram;
        if (req.body.facebook) profileValues.social.facebook = req.body.facebook;
        if (req.body.youtube) profileValues.social.youtube = req.body.youtube;

        Profile.findOne({user: req.user.id})
            .then(profile => {
                if(profile)
                {
                    console.log("updating" + req.user.id)
                    Profile.findOneAndUpdate(
                        { user: req.user.id },
                        { $set: profileValues },
                        { new : true})
                        .then(profile => {
                            res.json(profile);
                            console.log(profileValues.id + "Profile Updated" );
                        })
                        .catch(err => console.log("Error in updating profile" + err))
                    }
                
                else {
                    Profile.findOne({username: profileValues.username})
                        .then(profile => {
                            if(profile)
                            {
                                console.log("User exists")
                                return res.status(400).json({ username: "User already exists" });
                            }
                            else if(!profile)
                            {
                            
                                new Profile(
                                    {
                                        user: profileValues.id,
                                        username: profileValues.username,
                                        website: profileValues.website,
                                        country: profileValues.country,
                                        languages: profileValues.languages,
                                        portfolio: profileValues.portfolio,
                                        social: {
                                            instagram: profileValues.social.instagram,
                                            facebook: profileValues.social.facebook,
                                            youtube: profileValues.social.youtube}
                                    })
                                    .save()
                                    .then(profile => {
                                        res.json(profile);
                                        console.log("Profile Created");
                                }   )
                                .catch(err => console.log("Error in creating Profile " + err))
                            }
                        })
                        .catch(err => console.log("Error in finding and creating Profile" + err))
                    }
                }
            )
            .catch(err => console.log("Problem in fetching profile"+ err))
    })
    router.get('/user-profile/:username', (req, res)=> {
        Profile.findOne({username: req.params.username})
            .populate("user", ["name", "profilepic", "email"])
            .then(profile => {
                if(!profile)
                {
                   return res.status(400).json({username: "User Not Found"})
                }
                 res.json(profile)
            })
            .catch(err => console.log("Error in fetching username " + err));
    })

router.get('/user-profile/find/everyone', (req, res) => {
    Profile.find()
        .populate("user", ["name", "profilepic", "email"])
        .then(profiles => {
            if (!profiles) {
                return res.status(400).json({ username: "No user found!" })
            }
            res.json(profiles)
        })
        .catch(err => console.log("Error in fetching username " + err));
})

router.delete(
    "/user-profile", 
    passport.authenticate("jwt", {session: false}),
    (req, res) => {
        Profile.findOne({user: req.user.id})
        Profile.findOneAndRemove({user: req.user.id})
            .then( () => {
                Person.findOneAndRemove({_id: req.user.id})
                    .then( res.json({success: "Deletion was successfull"}))
                    .catch(err => console.log("Problem in Fetching and Deleting Person " + err))
            })
            .catch(err => console.log("Error in Fetching and Deleting Profile " + err))
    })

    router.post(
        "/workrole", 
        passport.authenticate("jwt", {session: false}), 
        (req, res) => {
            Profile.findOne({user: req.user.id})
                .then(profile => {
                    if(!profile)
                    {
                        return res.json({profilenotfounderror: "Profile Not Found for WorkRole"});
                    }
                    const newWork = {
                        role: req.body.role,
                        company: req.body.company,
                        country: req.body.country,
                        from: req.body.from,
                        to: req.body.to,
                        current: req.body.current,
                        details: req.body.details
                    };
                    profile.workrole.unshift(newWork);
                    profile.save()
                        .then( profile => res.json(profile))
                        .catch(err => console.log("Error in creating Workrole " + err))
                })
                .catch(err => console.log("Error in finding profile for workrole " + err))
        })

        router.delete(
            "/workrole/:wid",
            passport.authenticate("jwt", {session: false}),
            (req, res) => {
                Profile.findOne({user: req.user.id})
                    .then(profile => {
                        if(!profile)
                        {
                            return res.json({workroleerror: "No Such Workrole Found!"})
                        }
                        const removeThis = profile.workrole
                            .map(item => item.id)
                            .indexOf(req.params.wid);
                        profile.workrole.splice(removeThis, 1);
                        profile.save()
                            .then(profile => res.json(profile))
                            .catch(err => console.log("Error in Splicing the workrole" + err))
                    })
                    .catch(err => console.log("Error in deleting the workrole" + err))
            })
module.exports = router;