const bodyParser = require('body-parser');
const twilio = require('twilio');
const express = require('express')
require('dotenv').config()
const { MessagingResponse } = require('twilio').twiml;

const app = express()
const port = 3000

app.use(bodyParser.urlencoded({ extended: false }));

app.get('/', (req, res) => {
  res.send('Hello World of Postcard!')
})

app.post('/sms', twilio.webhook({validate: false}), (req, res) => {
  console.log("message recieved")
  console.log(req.body.Body)

  const twiml = new MessagingResponse();

  twiml.message('Thanks for sending this item!');

  res.type('text/xml').send(twiml.toString());
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})
