const Discord = require('discord.js');
const yts = require('yt-search');
const ytdl = require('ytdl-core');

const client = new Discord.Client();
client.queue = [];

client.on('ready', () => {
  client.user.setActivity("cajke");
});

client.on('message', message => {
	if (message.author.bot) return;

  if (message.content.startsWith("pusti care")){
    const channel = message.member.voice.channel;
    if(!channel) return message.channel.send("uđi u kanal");

    const query = message.content.split("pusti care")[1].slice(1);
    if(query.length == 0) return message.channel.send("šta da pustim");
    yts(query).then(response => {
      if(response.videos.length == 0) return message.channel.send("nemam je");
      const video = response.videos[0];
      message.channel.send("može brate");
      client.queue.push({channel: channel, url: video.url})
      if(client.queue.length == 1) play();
    });
  }
  else if(message.content.startsWith("gasi to")) {
    if(client.queue.length == 0) return message.channel.send("ništa ne puštam");
    if(client.queue[0].channel.members.size == 2) {
      client.queue[0].dispatcher.end();
      return message.channel.send("ae");
    }
    message.channel.send("ne seri kom smeta?").then(function (message){
      message.react("👎");
      client.queue[0].skipmsg = message;
    });
  }
});

client.on("messageReactionAdd", function(messageReaction, user){
  if(client.queue.length == 0) return;
  if(client.queue[0].skipmsg == messageReaction.message && messageReaction.count >= client.queue[0].channel.members.size/2) {
      client.queue[0].skipmsg.channel.send("ae");
      client.queue[0].dispatcher.end();
  }
});

const play = async () => {
  const request = client.queue[0];
  var connection = await request.channel.join();

  client.queue[0].dispatcher = connection.play(ytdl(request.url))
    .on('finish', () => {
      client.queue.shift();
      if(client.queue.length > 0) play();
      else request.channel.leave();
    })
    .on('error', error => console.error(error));
  client.queue[0].dispatcher.setVolumeLogarithmic(5 / 5);
}

client.login(process.env.BOT_TOKEN);
