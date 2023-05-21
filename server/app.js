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

app.post("/sms", twilio.webhook({ validate: false }), async (req, res) => {
  console.log("message recieved");
  console.log(req.body.Body);
  const twiml = new MessagingResponse();

  // getting fridge data from supabase
  const { data: fridge_data, error: fridge_error } = await supabase
    .from("fridges")
    .select("id", "fridge_name")
    .eq("fridge_number", req.body.To.substring(1));

  if (fridge_error) {
<<<<<<< HEAD
    console.log("fridge error:")
    console.log(fridge_error)
    twiml.message("Sorry, something went wrong. Try sending your message again.");
    res.type('text/xml').send(twiml.toString());
  }
  if (!fridge_data) {
    console.log("Fridge doesn't exist")
    twiml.message("Sorry, this fridge doesn't exist. Make sure you have the right phone number.");
    res.type('text/xml').send(twiml.toString());
  }

  // get sender data
<<<<<<< HEAD
  const { data:sender_data, error:sender_error } = await supabase
    .from('senders')
    .upsert({"sender_number": req.body.From.substring(1)}, {onConflict:"sender_number", ignoreDuplicates:false})
    .select("id")
  if (sender_error) {
    console.log("sender error:")
    console.log(sender_error)
    twiml.message("Sorry, something went wrong. Try sending your message again.");
    res.type('text/xml').send(twiml.toString());
  }

  //console.log(sender_data[0].id)
  //console.log(fridge_data[0].id)

  const { data:edge_data, error:edge_error } = await supabase
    .from("senderfridgeedges")
    .select()
    .eq("fridge_id", fridge_data[0].id)
    .eq("sender_id", sender_data[0].id)
  if (edge_error) {
    console.log("edge error:")
    console.log(edge_error)
    twiml.message("Sorry, something went wrong. Try sending your message again.");
    res.type('text/xml').send(twiml.toString());
  }

  let message_str
  // determine what sender is trying to do
  if (req.body.Body.includes("JOIN")) {
    message_str = await join(fridge_data, sender_data, edge_data, req.body, supabase)
  } else if (req.body.Body.includes("My name is ")) {
    //name
    message_str = set_name(fridge_data, sender_data, req.body, supabase)
  } else if (req.body.Body.includes("STOP")) {
    message_str = unsubscribe(fridge_data, sender_data, req.body, supabase)
  } else {
    //deal with url or note
    message_str = new_content(fridge_data, sender_data, req.body, supabase);
  }
  console.log(message_str)
  twiml.message(message_str);
  res.type("text/xml").send(twiml.toString());
});


const join = async (fridge_data, sender_data, edge_data, body, supabase) => {
  if (edge_data) {
    return `Looks like you've already joined this fridge.\nIf you'd like to update your name you can say, \"My name is..\"\n\nIf you'd like to stop receiving messages from this fridge, you can say, \"STOP\".`
  } else {
    return `Welcome to Postcard! You just joined ${fridge_name}. You can send urls to this number and they will show up as postcards on this fridge.\nIf you'd like to set a name for yourself on this fridge, you can say, \"My name is...\"\nIf you'd like to leave this fridge, you can say, \"STOP\".`
  }
}

const set_name = async (fridge_data, sender_data, body, supabase) => {
  if (sender_data) {
    let name = body.Body.split("My name is ")[1]
    const { error } = await supabase.from("senderfridgeedges").update({
      sender_name: name
    })
    .eq('id', edge_id)

    if (message_error || !validUrl.isUri(link)) {
  }
    return "Looks like you've already joined this fridge.\nIf you'd like to update your name you can say, \"My name is..\"\n If you'd like to stop receiving messages from this fridge, you can say, \"STOP\"."
  } else {
    return "Looks like you haven't joined this fridge yet. You can say \"JOIN\" to get started!"
  }
}

const unsubscribe = async (fridge_data, sender_data, body, supabase) => {
}

const new_content = async (fridge_data, sender_data, body, supabase) => {
  if (!sender_data) {
    //sender needs to exist before sending a link or note
    console.log("Sender doesn't exist");
    return (
      "Thanks for messaging " +
      fridge_name +
      "! It looks like you haven't joined this fridge yet. Send JOIN to get started."
    );
  }

  let fridge_name = fridge_data.fridge_name;
  let msg_content = body.Body.trim();

  // if the message is a link
  if (validUrl.isUri(msg_content)) {
    //save in supabase as new message
    const { message_error } = await supabase.from("messages").insert({
      link: msg_content,
      sender_id: sender_data.id,
      fridge_id: fridge_data.id,
    });
    if (message_error) {
      console.log(message_error);
      return "Sorry, something went wrong. Try sending the item again. Make sure you send only a link as the first message (no notes)";
    }
    return (
      "Thanks for sending this item to " +
      fridge_name +
      "! If you want to add a note to this link, send it in a separate message. :) Otherwise, toodles."
    );
  } else {
    //check if there was a link sent from supabase within the last 10 minutes
    const { data: latest_message_data, error: message_error } = await supabase
      .from("messages")
      .select("id, created_at")
      .eq("sender_id", sender_data.id)
      .eq("fridge_id", fridge_data.id)
      .range("created_at", new Date(Date.now() - 10 * 60000), new Date()) //within the last ten minutes
      .order("created_at", { ascending: false })
      .limit(1);

    if (message_error) {
      return "Sorry, something went wrong. Try sending the item again. :(";
    }

    //if yes, update most recent message with the note
    if (latest_message_data) {
      const { update_message_data, update_message_error } = await supabase
        .from("messages")
        .update({
          note: msg_content,
        })
        .match({ id: latest_message_data.id });

      return "Thanks for adding this note! Have a fridgetastic day.";
    }

    //otherwise, ignore the note
    return "Were you trying to send a link? If so, try sending it again. Otherwise, have a fridgetastic day.";
  }
};

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
