require("dotenv").config();
const supabaseClient = require("@supabase/supabase-js");
const bodyParser = require("body-parser");
const twilio = require("twilio")
const twilio_client = require("twilio")(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
const express = require("express");
var validUrl = require("valid-url");

const { MessagingResponse } = require("twilio").twiml;

const app = express();
const port = 3000;

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

const supabase = supabaseClient.createClient(
  process.env.SUPABASE_PROJECT_ID,
  process.env.SUPABASE_API_KEY
);


app.get("/", (req, res) => {
  res.send("Hello World of Postcard!");
});

app.post("/sms", twilio.webhook({ validate: false }), async (req, res) => {
  console.log("message recieved");
  //console.log(req.body.Body);
  const twiml = new MessagingResponse();

  // getting fridge data from supabase
  const { data: fridge_data, error: fridge_error } = await supabase
    .from("fridges")
    .select()
    .eq("fridge_number", req.body.To.substring(1));

  if (fridge_error) {
    console.log("fridge error:");
    console.log(fridge_error);
    twiml.message(
      "Oops, something went wrong. Try sending your message again."
    );
    res.type("text/xml").send(twiml.toString());
    return
  }
  if (!record_exists(fridge_data)) {
    console.log("Fridge doesn't exist");
    twiml.message(
      "Hmmmm, this fridge doesn't exist. Make sure you have the right phone number."
    );
    res.type("text/xml").send(twiml.toString());
    return
  }

  // get sender data
  const { data: sender_data, error: sender_error } = await supabase
    .from("senders")
    .upsert(
      { sender_number: req.body.From.substring(1) },
      { onConflict: "sender_number", ignoreDuplicates: false }
    )
    .select("id");
  if (sender_error) {
    console.log("sender error:");
    console.log(sender_error);
    twiml.message(
      "Sorry, something went wrong. Try sending your message again."
    );
    res.type("text/xml").send(twiml.toString());
    return
  }

  //console.log(sender_data[0].id)
  // console.log(fridge_data);

  const { data: edge_data, error: edge_error } = await supabase
    .from("senderfridgeedges")
    .select()
    .eq("fridge_id", fridge_data[0].id)
    .eq("sender_id", sender_data[0].id);
  if (edge_error) {
    console.log("edge error:");
    console.log(edge_error);
    twiml.message(
      "Sorry, something went wrong. Try sending your message again."
    );
    res.type("text/xml").send(twiml.toString());
    return
  }
  //console.log(edge_data)

  let message_str;
  // determine what sender is trying to do
  if (req.body.Body.includes("JOIN")) {
    message_str = await join(
      fridge_data,
      sender_data,
      edge_data,
      req.body,
      supabase
    );
  } else if (req.body.Body.toLowerCase().includes("my name is ")) {
    //name
    message_str = await set_name(
      fridge_data,
      sender_data,
      edge_data,
      req.body,
      supabase
    );
  } else if (req.body.Body.includes("LEAVE")) {
    message_str = await unsubscribe(
      fridge_data,
      sender_data,
      edge_data,
      req.body,
      supabase
    );
  } else {
    //deal with url or note
    message_str = await new_content(
      fridge_data,
      sender_data,
      edge_data,
      req.body,
      supabase
    );
  }
  console.log(message_str);
  twiml.message(message_str);
  res.type("text/xml").send(twiml.toString());
});

const record_exists = (supabase_fetch_result) => {
  if (supabase_fetch_result.length > 0) {
    return true;
  }
  return false;
};

const join = async (fridge_data, sender_data, edge_data, body, supabase) => {
  if (record_exists(edge_data)) {
    return `Looks like you've already joined ${fridge_data[0].fridge_name}.\nIf you'd like to update your name you can say, \"My name is..\"\n\nIf you'd like to stop receiving messages from this fridge, you can text LEAVE.`;
  } else {
    const { data, error } = await supabase.from("senderfridgeedges").insert({
      sender_id: sender_data[0].id,
      fridge_id: fridge_data[0].id,
    });
    if (error) {
      console.log("create edge error:");
      console.log(error);
      return `Sorry, something went wrong joining ${fridge_data[0].fridge_name}. Try again later.`;
    }
    return `Welcome to shelf life! You just joined the fridge, ${fridge_data[0].fridge_name}. You can send urls for kitchen-appropriate audio (podcasts, playlists, albums, etc.) to this number and they will show up as items in this fridge.\nIf you'd like to set a name for yourself in this fridge, you can say, \"My name is...\"\n\nIf you'd like to leave this fridge, you can text LEAVE.`;
  }
};

const set_name = async (
  fridge_data,
  sender_data,
  edge_data,
  body,
  supabase
) => {
  if (record_exists(edge_data)) {
    const name_start = body.Body.toLowerCase().indexOf("my name is ");
    let name = body.Body.slice(name_start + 11);
    const { error } = await supabase
      .from("senderfridgeedges")
      .update({
        sender_name: name,
      })
      .eq("id", edge_data[0].id);
    if (error) {
      console.log("set name error:");
      console.log(error);
      return `Sorry, something went wrong setting your name. Try again later.`;
    } else {
      return `Got it! We set your name for the fridge, ${fridge_data[0].fridge_name}, to ${name}.`;
    }
  } else {
    return `Looks like you haven't joined this fridge yet. You can text JOIN to get started!`;
  }
};

const unsubscribe = async (
  fridge_data,
  sender_data,
  edge_data,
  body,
  supabase
) => {
  if (record_exists(edge_data)) {
    const { data, error } = await supabase
      .from("senderfridgeedges")
      .delete()
      .eq("id", edge_data[0].id);
    if (error) {
      console.log("set name error:");
      console.log(error);
      return `Sorry, something went wrong removing you from this fridge. Try again later.`;
    } else {
      return `You've successful left ${fridge_data[0].fridge_name}. If you'd like to re-join this fridge, you can send JOIN.`;
    }
  } else {
    return `You haven't joined this fridge yet. Message JOIN if you'd like to.`;
  }
};

const new_content = async (
  fridge_data,
  sender_data,
  edge_data,
  body,
  supabase
) => {
  if (!record_exists(edge_data)) {
    //sender needs to exist before sending a link or note
    //console.log("Edge doesn't exist");
    return (
      `Thanks for messaging ${fridge_data[0].fridge_name}! It looks like you haven't joined this fridge yet. Text JOIN to get started.`
    );
  }

  let fridge_name = fridge_data[0].fridge_name;
  let msg_content = body.Body.trim();

  // if the message is a link
  if (validUrl.isUri(msg_content)) {
    //save in supabase as new message
    const { message_error } = await supabase.from("messages").insert({
      link: msg_content,
      sender_id: sender_data[0].id,
      fridge_id: fridge_data[0].id,
      edge_id: edge_data[0].id,
    });
    if (message_error) {
      console.log(message_error);
      return "Sorry, something went wrong. Try sending the item again. Make sure you send only a link as the first message (no notes)";
    }
    return (
      `Thanks for sending this item to ${fridge_name}! If you want to add a note to this link, send it in a separate message. :) Otherwise, toodles.`
    );
  } else {
    //check if there was a link sent from supabase within the last 10 minutes
    const { data: latest_message_data, error: message_error } = await supabase
      .from("messages")
      .select("id, created_at")
      .eq("sender_id", sender_data[0].id)
      .eq("fridge_id", fridge_data[0].id)
      .gt("created_at", new Date(Date.now() - 10 * 60000).toISOString()) //within the last ten minutes
      .order("created_at", { ascending: false })
      .limit(1);

    if (message_error) {
      console.log("time check error")
      console.log(message_error)
      return "Sorry, something went wrong. Try sending the item again. :(";
    }


    //if yes, update most recent message with the note
    if (record_exists(latest_message_data)) {
      const { update_message_data, update_message_error } = await supabase
        .from("messages")
        .update({
          note: msg_content,
        })
        .eq("id", latest_message_data[0].id);

      if (update_message_error) {
        console.log("Update message error:")
        console.log(update_message_error)
        return "Sorry, something went wrong. Try sending the item again. :(";
      }
      return "Thanks for adding this note! Have a fridgetastic day.";
    }

    //otherwise, ignore the note
    return "Were you trying to send a link? If so, try sending it again. Otherwise, have a fridgetastic day.";
  }
};

const message_updated = async (
  payload
) => {
  if (!payload.old.is_read_by_fridge) {
    console.log("message_read")
    if (payload.new.edge_id) {
      const {data:sender_data, error:sender_error} = await supabase
        .from("senders")
        .select()
        .eq("id", payload.new.sender_id)
      if (sender_error) {
        console.log("sender_error")
        console.log(sender_error)
        return
      }

      const {data:fridge_data, error:fridge_error} = await supabase
        .from("fridges")
        .select()
        .eq("id", payload.new.fridge_id)
      if (fridge_error) {
        console.log("fridge_error")
        console.log(fridge_error)
        return
      }

      const message_body = `Someone just opened one of your items from the fridge, ${fridge_data[0].fridge_name}!`
      const from = "+".concat(fridge_data[0].fridge_number)
      const to = "+".concat(sender_data[0].sender_number)

      //send message to sender
      twilio_client.messages
        .create({
           body: message_body,
           from: from,
           to: to
         })
        .then(message => console.log(message));
    }
  }
}

// listen for changes to message read column of messages table
 const channel = supabase
  .channel('any')
  .on(
    'postgres_changes',
    {
      event: 'UPDATE',
      schema: 'public',
      table: 'messages',
      filter: 'is_read_by_fridge=eq.true'
    },
    (payload) => message_updated(payload)
  )
  .subscribe()

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
