require('./src/db/mongoose');
const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const multer = require("multer")

// const redis = require('./redis');

const routes = require('./src/routes/routes');

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

const port = process.env.PORT || 4000;

app.get('/', (req, res) => {
    res.send("Welcome");
});

app.get('/route', async (req, res) => {
    const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
    console.log("ip",ip)
    // const requests = await incr(ip);
    // console.log("request", requests)
    // console.log(`Number of requests made so far {requests}`);
    // if (requests === 1) {
    //     await redis.expire(ip, 60);
    // }
    // if (requests > 5) {
    //     res.status(503)
    //         .json({
    //             response: 'Error',
    //             callsMade: requests,
    //             msg: 'Too many calls made'
    //         });
    // } else
        res.json('You have successfully hit route');
})

// app.use(limiter);

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, "uploads/")
    },
    filename: (req, file, cb) => {
      cb(null, Date.now() + "-" + file.originalname)
    },
  })
  
  const uploadStorage = multer({ storage: storage })
  
  // Single file
  app.post("/upload/single", uploadStorage.single("file"), (req, res) => {
    console.log(req.file)
    return res.send("Single file")
  })
  //Multiple files - but here uploaded files limited to 10
  app.post("/upload/multiple", uploadStorage.array("file", 10), (req, res) => {
    console.log(req.files)
    return res.send("Multiple files")
  })

routes.apiRoutes(app);

app.listen(port, function () {
    console.log(`Node server is listening on port ${port}`);
});