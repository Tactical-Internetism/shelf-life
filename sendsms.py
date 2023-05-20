import os
from twilio.rest import Client
# Set environment variables for your credentials
# Read more at http://twil.io/secure
account_sid = "ACd42f0983fb11f7524f9597f1573bfec7"
auth_token = "ff5126211373e0ebe430f5289d3b3b40"
client = Client(account_sid, auth_token)
message = client.messages.create(
  body="Hello from Twilio",
  from_="+18667068339",
  to="+19292848175"
)
print(message.sid)
