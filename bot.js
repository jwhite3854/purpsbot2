const PURPSbot = require('./purpsbot/main');

require('dotenv').config();
const Discord = require("discord.js");
const client = new Discord.Client({intents: ["GUILDS", "GUILD_MESSAGES", "DIRECT_MESSAGES"], partials: ['CHANNEL']});

client.on("ready", () => {
  console.log(`Logged in as ${client.user.tag}!`)
})
client.on("messageCreate", message => {
  if (PURPSbot.isListening(message)) {
    PURPSbot.runCommand();
    message.reply(PURPSbot.reply)
      .then(() => console.log(`Replied to message "${message.content}"`))
      .catch(console.error);
  }
})
client.login(process.env.DISCORD_TOKEN);
