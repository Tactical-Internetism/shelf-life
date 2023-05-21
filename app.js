const supabaseClient = require("@supabase/supabase-js");
const bodyParser = require("body-parser");
const twilio = require("twilio");
const express = require("express");
var validUrl = require("valid-url");

require("dotenv").config();
const { MessagingResponse } = require("twilio").twiml;

const app = express();
const port = 3000;

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

const supabase = supabaseClient.createClient(
  "https://ajfdbcwkkbrqhcbuvbcj.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFqZmRiY3dra2JycWhjYnV2YmNqIiwicm9sZSI6ImFub24iLCJpYXQiOjE2ODQ2MDcxOTIsImV4cCI6MjAwMDE4MzE5Mn0.wrxu5FPskgh00BxWlxw1oKr5Z-DVDk20t8kLtJxr_Kc"
);

app.get("/", (req, res) => {
  res.send("Hello World of Postcard!");
});

app.post('/sms', twilio.webhook({validate: false}), async (req, res) => {
  console.log("message recieved")
  console.log(req.body.Body)
  const twiml = new MessagingResponse();

  // getting fridge data from supabase
  const { data:fridge_data, error:fridge_error } = await supabase
    .from('fridges')
    .select("id", "fridge_name")
    .eq("fridge_number", req.body.To.substring(1));

  if (fridge_error) {
    console.log("error:")
    console.log(fridge_error)
    twiml.message("Sorry, something went wrong. Try sending your message again.");
    res.type('text/xml').send(twiml.toString());
  }
  if (fridge_data) {
    fridge_id = fridge_data.id
    fridge_name = fridge_data.fridge_name
  } else {
    console.log("Fridge doesn't exist")
    twiml.message("Sorry, this fridge doesn't exist. Make sure you have the right phone number.");
    res.type('text/xml').send(twiml.toString());
  }
  
  // get sender data
  const { data:sender_data, error:sender_error } = await supabase
    .from('senders')
    .select("id")
    .eq("sender_number", req.body.From.substring(1))
  if (sender_error) {
    console.log("error:")
    console.log(sender_error)
    twiml.message("Sorry, something went wrong. Try sending your message again.");
    res.type('text/xml').send(twiml.toString());
  }

  let message_str
  // determine if the sender is joining
  if (req.body.Body.includes("JOIN")) {
    message_str = join(fridge_data, sender_data, req.body, supabase)
  } else if (req.body.Body.includes("My name is") {{
    //name
    message_str = set_name(fridge_data, sender_data, req.body, supabase)
  } else if req.body.Body.includes("STOP") {
    message_str = unsubscribe(fridge_data, sender_data, req.body, supabase)
  } else {
    //deal with url or note
    message_str = new_content(fridge_data, sender_data, req.body, supabase)
  }
  twiml.message(message_str);
  res.type('text/xml').send(twiml.toString());
});


function join(fridge_data, sender_data, body) {
  if (sender_data) {
    twiml.message("Looks like you've already joined this fridge.\nIf you'd like to update your name you can say, \"My name is..\"\n If you'd like to stop receiving messages from this fridge, you can say, \"STOP\".");
    res.type('text/xml').send(twiml.toString());
  } else {
    console.log("Sender doesn't exist")
    twiml.message("Welcome to Postcard! You just joined ${fridge_name}. You can send urls to this number and they will show up as postcards on this fridge.\nIf you'd like to set a name for yourself on this fridge, you can say, \"My name is...\"\nIf you'd like to leave this fridge, you can say, \"STOP\".");
    res.type('text/xml').send(twiml.toString());
  }
}

function set_name(fridge_data, sender_data, body, supabase) {
}
function unsubscribe(fridge_data, sender_data, body, supabase) {
}

function new_content(fridge_data, sender_data, body, supabase) {
  if (sender_data) {
    sender_id = sender_data.id
  } else {
    console.log("Sender doesn't exist")
    twiml.message("Thanks for messaging ${fridge_name}! It looks like you haven't joined this fridge yet. Send JOIN to get started.");
    res.type('text/xml').send(twiml.toString());
  }


  link = req.body.Body.trim();
  note = req.body.Body;

  const { message_error } = await supabase.from("messages").insert({
    link: link,
    note: note,
    sender_id: sender,
    fridge_id: fridge_id,
  });

  if (message_error || !validUrl.isUri(link)) {
    console.log(message_error);
    twiml.message(
      "Sorry, something went wrong. Try sending the item again. Make sure you send only a link as the first message (no notes)"
    );
    res.type("text/xml").send(twiml.toString());
  } else {
    twiml.message('Thanks for sending this item to ${fridge_name}!');
    res.type('text/xml').send(twiml.toString());
  }
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
