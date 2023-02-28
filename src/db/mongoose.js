const mongoose = require('mongoose');

mongoose.set('strictQuery', false);

mongoose.connect('mongodb://0.0.0.0:27017/TaylarFrancis', {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

mongoose.connection.once("open",function() {
    console.log("Mongodb connection established successfully")
});

