const mongoose = require('mongoose');
const uri = process.env.MONGODB_URI ?? null;

mongoose.set("strictQuery", false);
mongoose.connect(uri).then(() => console.log("Connected to MongoDB Atlas!")).catch(console.err);