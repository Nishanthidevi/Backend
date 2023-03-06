require('./src/db/mongoose');
require('dot-env');
const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const multer = require("multer")


// organization: "org-CekAepa3UocMeResTy3O2FqA",

// const { Configuration, OpenAIApi } = require("openai");
// const configuration = new Configuration({
//        apiKey: "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",
// });

// const redis = require('./redis');

const routes = require('./src/routes/routes');
const port = process.env.PORT || 4000;

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Access-Control-Allow-Credentials', true);
  next();
});

app.get('/route', async (req, res) => {
  res.json('You have successfully hit route');
})

// app.post('/summary', async (req, res)=> {
//   const openai = new OpenAIApi(configuration);
//   let text = req.body.text;
//   const response = await openai.createCompletion({
//     model: "text-ada-001",
//     prompt: text,
//     temperature: 0.7,
//     max_tokens: 60,
//     top_p: 1,
//     frequency_penalty: 0,
//     presence_penalty: 1,
//   }) 
//   console.log(response);
//   console.log(response.data.choices[0].text)
//   res.send(response.data.choices[0].text);
// })


// const storage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     cb(null, "uploads/")
//   },
//   filename: (req, file, cb) => {
//     cb(null, Date.now() + "-" + file.originalname)
//   },
// })

// const uploadStorage = multer({ storage: storage })

// // Single file
// app.post("/upload/single", uploadStorage.single("file"), (req, res) => {
//   console.log(req.file)
//   return res.send("Single file")
// })
// //Multiple files - but here uploaded files limited to 10
// app.post("/upload/multiple", uploadStorage.array("file", 10), (req, res) => {
//   console.log(req.files)
//   return res.send("Multiple files")
// })

routes.apiRoutes(app);

app.listen(port, () => {
  console.log(`Node server is listening on port ${port}`);
});