const express = require('express')
const cors = require('cors')
const app = express()
const port = process.env.PORT ?? 3000
require("dotenv").config();
const router = require('./routes')
require('./db')

const corsOptions = {
  origin: process.env.FRONTEND_URI ?? '*',
  optionsSuccessStatus: 200,
  credentials: true
}

app.use(express.json())
app.use(cors(corsOptions))

app.use('/api', router)

app.listen(port, () => console.log(`Server listening on port ${port}`))

module.exports = app;