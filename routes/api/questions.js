const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const passport = require('passport');

const Person = require('../../Models/Person');
const Profile = require('../../Models/Profile');
const Question = require('../../Models/Question');

router.get("/questions", (req, res, next) => {
    res.send("Questions");
})

router.post(
    "/post-question",
    passport.authenticate("jwt", {session: false}),
    (req, res) => {
        const newQuestion= new Question({
            textone: req.body.textone,
            texttwo: req.body.texttwo,
            user: req.user.id,
            name: req.body.name
        });
        newQuestion
            .save()
            .then(question => res.json(question))
            .catch(err => console.log("Error in posting question " + err))
    });

    router.get("/all-questions", (req, res) => {
        console.log("question")
        Question.find()
                .sort({date: "desc"})
                .then(questions => res.json(questions))
            .catch(err => res.json({questionerror: "Error in Finding any Question" + err}))
    })
    
    router.post(
        "/post-answer/:id",
        passport.authenticate("jwt", {session: false}),
        (req, res) => {
            Question.findById(req.params.id)
                .then( question => {
                    const newAnswer= {
                        user: req.user.id,
                        text: req.body.text,
                        name: req. body.name
                    }
                    question.answers.unshift(newAnswer);
                    question.save()
                        .then(question => res.json(question))
                        .catch(err => console.log("Error in pushing answer " + err))
                })
                .catch(err => console.log("Error in posting answer" + err))
        })

        router.post(
            "/post-question/upvote/:id",
            passport.authenticate("jwt", {session: false}),
            (req, res) => {
                Profile.findById(req.user.id)
                    .then( profile => {
                            Question.findById(req.params.id)
                                .then(question => {
                                    var newQuestionUpvote = {
                                        user: req.user.id
                                    }
                                    if (question.upvotes.filter(upvote => upvote.user.toString() === req.user.id.toString()).length > 0) 
                                    {
                                        question.upvotes.pop(newQuestionUpvote)
                                        question.save()
                                            .then( ()=> res.json({downvote: "Successfully Downvoted"}) )
                                            .catch(err => console.log("Error in Downvoting" + err))
                                        //return res.json({upvoteerror: "User has already upvoted"})
                                    } else {
                                    question.upvotes.unshift(newQuestionUpvote);
                                    question.save()
                                        .then(question => res.json(question))
                                        .catch(err => console.log("Error in pushing Upvote " + err))
                                    }
                                })
                                .catch(err => console.log('Error in posting upvotes' + err))
                            })
                    .catch(err => console.log("Error in finding profile " +  err))
            })

            router.post(
                "/post-answer/upvote/:id",
                passport.authenticate("jwt", {session: false}),
                (req, res) => {
                    Question.answers.findById(req.params.id)
                        .then(question => {
                            const newAnswerUpvote = {
                                user: req.user.id
                            }
                            question.answers.upvotes.unshift(newAnswerUpvote);
                            question.save()
                                .then(question => res.json(question))
                                .catch(err => console.log("Error in pushing upvote to an answer " +  err))
                        })
                        .catch(err => console.log("Error in posting upvote to an answer " + err))
                })
module.exports = router;