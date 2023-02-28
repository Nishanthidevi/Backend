const mongoose = require('mongoose');

mongoose.set('strictQuery', false);

mongoose.connect('mongodb+srv://akh:root@backend.wv5zvim.mongodb.net/test', {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

mongoose.connection.once("open",function() {
    console.log("Mongodb connection established successfully")
});

