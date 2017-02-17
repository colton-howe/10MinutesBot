/*
  Author: Colton Howe
  Version: 0.1
  Date: Feb 16th, 2017
  Description: Initial implementation of Timing Bot
*/

var JeremyDate = new Date();
var timing = 0;
var startTime = 0;
var endTime = 0;

// import the discord.js module
const Discord = require('discord.js');

// create an instance of a Discord Client, and call it bot
const client = new Discord.Client();
const token = 'INSERT TOKEN HERE';

// the ready event is vital, it means that your bot will only start reacting to information
// from Discord _after_ ready is emitted.
client.on('ready', () => {
  console.log('I am ready!');
});

// create an event listener for messages
client.on('message', message => {
  if (message.content === '!time') {
    if(timing == 0){
      message.channel.sendMessage('Starting Timer');
      startTime = JeremyDate.getTime();
    } else {
      endTime = JeremyDate.getTime();
      var timeAFK = endTime-startTime;
      var seconds = date.getUTCSeconds()
      var minutes = date.getUTCMinutes()
      var hours = date.getUTCHours()
      var days = date.getUTCDate()-1;
      if(seconds == 0) {
        message.channel.sendMessage('Wow, that was fast!');
      } else if (minutes == 0) {
        message.channel.sendMessage('Jeremy was AFK for ' + seconds + 'seconds');
      } else if (hours == 0 && minutes < 10) {
        message.channel.sendMessage('Jeremy was AFK for ' + minutes + ' minutes and ' + seconds + ' seconds');
      } else if (hours == 0 && minutes >= 10) {
        message.channel.sendMessage(':10minutes: Jeremy was AFK for ' + minutes + ' minutes and ' + seconds + ' seconds :10minutes:');
      } else if (days == 0) {
        message.channel.sendMessage(':10minutes: Jeremy was AFK for ' + hours + ' hours, ' + minutes + ' minutes and ' + seconds + ' seconds :10minutes:');
      } else {
        message.channel.sendMessage(':10minutes: Jeremy was AFK for ' + days + ' days, ' + hours + ' hours, ' + minutes + ' minutes and ' + seconds + ' seconds :10minutes:');
      }
    }
  }
});

// log our bot in
client.login(token);
