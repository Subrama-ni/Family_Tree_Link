const { Client, LocalAuth } = require("whatsapp-web.js");

const qrcode = require("qrcode-terminal");

const express = require("express");

const cors = require("cors");

const app = express();

app.use(cors());

app.use(express.json());

const client = new Client({
  authStrategy: new LocalAuth(),

  puppeteer: {
    headless: false,
    protocolTimeout: 300000,
  },
});
/* QR EVENT */

client.on("qr", (qr) => {
  console.log("Scan QR Code");

  qrcode.generate(qr, { small: true });
});

/* AUTHENTICATED */

client.on("authenticated", () => {
  console.log("Authenticated Successfully");
});

/* AUTH FAILURE */

client.on("auth_failure", (msg) => {
  console.log("Authentication Failed:", msg);
});

/* READY */

client.on("ready", async () => {
  console.log("WhatsApp Connected");

  console.log("\n===== GROUP LIST =====\n");

  const chats = await client.getChats();

  chats.forEach((chat) => {
    if (chat.isGroup) {
      console.log(`GROUP: ${chat.name}`);

      console.log(`ID: ${chat.id._serialized}`);

      console.log("-------------------");
    }
  });
});

/* DISCONNECTED */

client.on("disconnected", (reason) => {
  console.log("Disconnected:", reason);
});

client.initialize();

/* TEST API */

app.post("/send-message", async (req, res) => {
  try {
    const { groupId, message } = req.body;

    const chat = await client.getChatById(groupId);

    await chat.sendMessage(message);

    res.send("Message Sent");
  } catch (error) {
    console.error(error);

    res.status(500).send(error);
  }
});

app.listen(3001, () => {
  console.log("WhatsApp API Running On Port 3001");
});
