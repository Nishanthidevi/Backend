const Users = require('../models/userRegister.model');
const ActiveBooks = require('../models/activeBooks.model');
const _ = require("lodash");
const { filter } = require('lodash');
// const {openai,summarize} = require('openai');
const { Configuration, OpenAIApi } = require("openai");
// const { summarize } = require('@openai/summarize');
const Speech = require('../models/speech.model');
const AWS = require('aws-sdk'); 
let SummarizerManager = require("node-summarizer").SummarizerManager;

exports.getUsers = async (req) => {
    try {
        return await Users.find(req.query);
    } catch (e) {
        return e;
    }
};

exports.getUserById = async (req) => {
    try {
        return await Users.find({ user_id: req.params.id });
    } catch (e) {
        return e;
    }
};

exports.saveUser = async (req) => {
    try {
        const user = await Users.find({ "user_id": req.user_id });
        if (!user.length > 0) {
            const payload = {
                user_id: req.user_id,
                books: [
                    {
                        book_id: req.book_id,
                        bookMark: [req.bookMark],
                        notes: [req.notes]
                    }
                ]
            }
            var userRecord = new Users(payload);
            return userRecord.save();
        } else {
            const user = await Users.findOne({ "user_id": req.user_id, "books.book_id": req.book_id });
            if (_.isEmpty(user)) {
                return await Users.findOneAndUpdate({ user_id: req.user_id }, {
                    $push: {
                        books: {
                            book_id: req.book_id,
                            bookMark: [req.bookMark],
                            notes: [req.notes]
                        }
                    }
                })
            } else {
                const selectedBook = user.books.filter((obj) => obj.book_id === req.book_id)[0];
                selectedBook.bookMark.push(req.bookMark);
                selectedBook.notes.push(req.notes);
                return await Users.findOneAndUpdate({ "user_id": req.user_id, "books.book_id": req.book_id }, {
                    $set: {
                        "books.$.bookMark": selectedBook.bookMark,
                        "books.$.notes": selectedBook.notes
                    }
                });
            }
        }
    } catch (e) {
        console.log("Error ", e)
        return e;
    }
}

exports.updateActiveBookUser = async (req, res) => {
    try {
        const book = await ActiveBooks.findOne({ "book_id": req.book_id });
        if (_.isEmpty(book) || _.isEmpty(book.activeUsers)) {
            const filter = { book_id: req.book_id };
            const update = {
                activeUsers: [
                    {
                        user_id: req.user_id,
                        timestamp: new Date()
                    }
                ]
            }
            let doc = await ActiveBooks.findOneAndUpdate(filter, update, {
                new: true,
                upsert: true // Make this update into an upsert
            });
            return doc;
        }
        const activeUsers = book.activeUsers;
        const filteredActiveUsers = activeUsers.filter((obj) => {
            return this.diff_minutes(obj.timestamp, new Date()) <= 3;
        });
        const existingUser = filteredActiveUsers.find((obj) => obj.user_id === req.user_id);
        if (filteredActiveUsers.length < 3) {
            for (var i = 0; i < filteredActiveUsers.length; i++) {
                if (filteredActiveUsers[i].user_id == req.user_id) {
                    filteredActiveUsers[i].timestamp = new Date();
                    break;
                } else if (!existingUser && filteredActiveUsers.length < 3) {
                    filteredActiveUsers.push({ user_id: req.user_id, timestamp: new Date() });
                    break;
                }
            }
        } else if (existingUser) {
            for (var i = 0; i < filteredActiveUsers.length; i++) {
                if (filteredActiveUsers[i].user_id == req.user_id) {
                    filteredActiveUsers[i].timestamp = new Date();
                    break;
                }
            }
        } else {
            throw { message: "Active users limit exceeded", status: 400 };
        }
        return await ActiveBooks.updateOne({ "book_id": req.book_id }, { $set: { activeUsers: filteredActiveUsers } });

    } catch (e) {
        throw e;
    }
}

exports.summarizeText = async (req, res) => {
    try {
        var decodedText = decodeURIComponent(req.text);
        let Summarizer = new SummarizerManager(decodedText,5); 
        let summary = Summarizer.getSummaryByFrequency().summary;
        var encodedSummary = encodeURIComponent(summary);
        return encodedSummary;
    } catch (e) {
        throw e;
    }
}

exports.getBookmarks = async (req) => {
    try {
        return await Users.find({ user_id: req.query.user_id, "books.book_id": req.query.book_id },
            { "books.$": 1, _id: 0 });
    } catch (e) {
        return e;
    }
};

exports.diff_minutes = (dt2, dt1) => {
    var diff = (dt2.getTime() - dt1.getTime()) / 1000;
    diff /= 60;
    return Math.abs(Math.round(diff));
}



// function diff_minutes(dt2, dt1){
//
//     var diff =(dt2. getTime() - dt1. getTime()) / 1000;
//     diff /= 60;
//     return Math. abs(Math. round(diff));
// }


// exports.activeBooks = async (req) => {
//     try {
//         return await ActiveBooks.findByIdAndDelete(req.body)
//     } catch (e) {
//         return e;
//     }
// }

exports.getUpdatatedBookmarks = async (req, res) => {
    try {
        if (bookMarks == req.body.bookMarks && notes == null) {
            const filter = { user_id: req.user_id };
            const update = { $push: { books: { $each: [{ bookMark: req.body.bookMark }, { notes: req.body.notes }] } } };
            const updatedBookMarks = Users.findOneAndUpdate(filter, update, {
                new: true,
                upsert: true
            }
            );
            return updatedBookMarks;
        } else {
            const UpdatatedNotes = Users.findOneAndUpdate(filter, update,
                {
                    new: true,
                    upsert: true,
                }
            );
            return UpdatatedNotes;
        }
    } catch (e) {
        return e;
    }
}

exports.getUpdatatedNotes = async (req, res) => {
    try {
        if (notes == req.body.notes && bookMarks == null) {
            // Update the document with new values for the oldField array
            const filter = { user_id: req.user_id };
            const update = { $push: { books: { $each: [{ bookMark: req.body.bookMark }, { notes: req.body.notes }] } } };
            const UpdatatedNotes = Users.findOneAndUpdate(filter, update,
                {
                    new: true,
                    upsert: true,
                }
            );
            return UpdatatedNotes;
        } else {
            const updatedBookMarks = Users.findOneAndUpdate(filter, update, {
                new: true,
                upsert: true
            }
            );
            return updatedBookMarks;
        }
    } catch (e) {
        return e;
    }
}

exports.updateSummarizeText = async (req, users) => {
    try {
        const configuration = new Configuration({
            apiKey: "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",
        });
        const openai = new OpenAIApi(configuration);
        let text = req.body.text;
        const response = await openai.createCompletion({
            model: "text-ada-001",
            prompt: text,
            temperature: 0.7,
            max_tokens: 60,
            top_p: 1,
            frequency_penalty: 0,
            presence_penalty: 1,
        })
        // console.log(response.data.choices[0].text)
        // res.send(response.data.choices[0].text);
        return text;
    } catch (e) {
        return e
    }
}

exports.convertTextToSpeech = async (req, text) => {
    try {
        AWS.config.update({
            accessKeyId: process.env.ACCESSKEYID,
            secretAccessKey: process.env.SECRETACCESSKEY,
            region: 'us-west-2' 
        });

        const polly = new AWS.Polly();

        const params = {
            OutputFormat: 'mp3',
            Text: req.body.text,
            TextType: 'text',
            VoiceId: 'Joanna'
        };

        const data = await polly.synthesizeSpeech(params).promise();

        const speech = new Speech({
            text: req.body.text,
            url: data.AudioStream.toString('base64')
        });

        await speech.save();
        console.log("speech", speech);
        return speech;

    } catch (e) {
        return e;
    }
}