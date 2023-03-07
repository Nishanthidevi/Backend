const Users = require('../models/userRegister.model');
const ActiveBooks = require('../models/activeBooks.model');
const _ = require("lodash");
const { filter } = require('lodash');
const { Configuration, OpenAIApi } = require("openai");
const Speech = require('../models/speech.model');
const AWS = require('aws-sdk');
let SummarizerManager = require("node-summarizer").SummarizerManager;
const googleTTS = require('google-tts-api'); // CommonJS
const { GetObjectCommand, S3Client } = require("@aws-sdk/client-s3");

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
                        bookMark: !_.isEmpty(req.bookMark) ? [req.bookMark] : [],
                        notes: !_.isEmpty(req.notes) ? [req.notes] : [],
                        summary: !_.isEmpty(req.summary) ? [req.summary] : []
                    }
                ]
            }
            var userRecord = new Users(payload);
            return userRecord.save();
        } else {
            const user = await Users.findOne({ "user_id": req.user_id, "books.book_id": req.book_id });
            if (_.isEmpty(user)) {
                let updateQery = {
                    book_id: req.book_id
                }
                if(!_.isEmpty(req.bookMark)){
                    updateQery.bookMark = [req.bookMark]
                }
                if(!_.isEmpty(req.notes)){
                    updateQery.notes = [req.notes]
                }
                if(!_.isEmpty(req.summary)){
                    updateQery.summary = [req.summary]
                }
                return await Users.findOneAndUpdate({ user_id: req.user_id }, {
                    $push: {
                        books: updateQery
                    }
                }, {new: true})
            } else {
                let updateQery = {};
                const selectedBook = user.books.filter((obj) => obj.book_id === req.book_id)[0];
                if(!_.isEmpty(req.bookMark)){
                    selectedBook.bookMark.push(req.bookMark);
                    updateQery["books.$.bookMark"] = selectedBook.bookMark;
                }
                if(!_.isEmpty(req.notes)){
                    selectedBook.notes.push(req.notes);
                    updateQery["books.$.notes"] = selectedBook.notes;
                }
                if(!_.isEmpty(req.summary)){
                    selectedBook.summary.push(req.summary);
                    updateQery["books.$.summary"] = selectedBook.summary;
                }
                return await Users.findOneAndUpdate({ "user_id": req.user_id, "books.book_id": req.book_id }, {
                    $set: updateQery
                }, {new: true});
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
        let Summarizer = new SummarizerManager(decodedText, 5);
        let summary = Summarizer.getSummaryByFrequency().summary;
        var encodedSummary = encodeURIComponent(summary);
        return encodedSummary;
    } catch (e) {
        throw e;
    }
}

exports.getBookmarks = async (req) => {
    try {
        let result = await Users.find({ user_id: req.query.user_id, "books.book_id": req.query.book_id },
            { "books.bookMark.$": 1, _id: 0 });
        result = JSON.parse(JSON.stringify(result))
        return result[0].books[0].bookMark;
    } catch (e) {
        console.log("ee ",e)
        return e;
    }
};

exports.getNotes = async (req) => {
    try {
        let result =  await Users.find({ user_id: req.query.user_id, "books.book_id": req.query.book_id },
            { "books.notes.$": 1, _id: 0 });
        result = JSON.parse(JSON.stringify(result))
        return result[0].books[0].notes;
    } catch (e) {
        console.log("ee ",e)
        return e;
    }
};

exports.getSummary = async (req) => {
    try {
        let result =  await Users.find({ user_id: req.query.user_id, "books.book_id": req.query.book_id },
            { "books.summary.$": 1, _id: 0 });
        result = JSON.parse(JSON.stringify(result))
        return result[0].books[0].summary;
    } catch (e) {
        console.log("ee ",e)
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
            accessKeyId: process.env.AWS_ACCESS_KEY_ID,
            secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
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
        return speech;
    } catch (e) {
        return e;
    }
}

exports.convertTextToSpeechV2 = async (req) => {
    const results = googleTTS.getAllAudioUrls(req.text, {
        lang: 'en',
        slow: false,
        host: 'https://translate.google.com',
        splitPunct: ',.?',
      });
      return results;
}

exports.getPdfExtractedPages = async () => {

        // const s3 = new AWS.S3({
        //     region: 'us-west-2',
        //     credentials: {
        //         accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        //         secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
        //     },
        //   });
        //   const resp = await s3.getObject({
        //     Bucket: "bookreader",
        //     Key: "Moby_Dick-Herman_Melville.pdf",
        //   });
        //   console.info(await new Response(resp.Body, {}).text())

        const s3 = new AWS.S3();

        // AWS.config.update({
        //     accessKeyId: "",
        //     secretAccessKey: "",
        //     region: 'us-west-2'
        // });

        const params = {
            Bucket: "bookreader",
            Key: "Moby_Dick-Herman_Melville.pdf"
        };

        s3.getObject(params,(err, data) => {
        // s3.listObjects(params, (err, data) => {
            if (err) {
                console.error(err);
            } else {
                // const json = JSON.parse(data.Body.toString('utf-8'));
                // // Insert the JSON data into MongoDB
                console.log("data", data.Body.toString('utf-8'));
                // console.log("data:", data);
                // res.send(data);
            }
        });

        // const client = new S3Client({region: 'us-west-2'});
        
        // const command = new GetObjectCommand({
        //     Bucket: "bookreader",
        //     Key: "hello-s3.txt"
        // });

        // try {
        //     const response = await client.send(command);
        //     console.log("response", response);
        //     // The Body object also has 'transformToByteArray' and 'transformToWebStream' methods.
        //     const str = await response.Body.transformToString();
        //     console.log(str);
        // } catch (err) {
        //     console.error(err);
        // }
}