require('./src/db/mongoose');
const express = require('express');
const app = express();
const bodyParser = require('body-parser');
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

routes.apiRoutes(app);

app.listen(port, function () {
    console.log(`Node server is listening on port ${port}`);
});