/*
  Author: Colton Howe
  Version: 0.5
  Date: Feb 16th, 2017
  Description: Working on optimization
*/

// import the discord.js module
const Discord = require('discord.js');
var express = require('express');
var fs = require('fs');
var request = require('request');
var cheerio = require('cheerio');
var app = express();

//Variables to deal with the !time command
var startTime;
var endTime;
var days = 0;
var startUser;
var allTimedUsers = [];

// create an instance of a Discord Client, and call it bot
const client = new Discord.Client();
const token = fs.readFileSync('key.txt', 'utf8');

//Classes
function timedUser(username) {
  this.name = username;
  this.startTime;
  this.endTime;
  this.seconds;
  this.minutes;
  this.hours;
  this.days;
}

//D&D Functions
function getCharacterSheet(charName, bot){
  var fileName = charName.toLowerCase() + '.json'; 
  var charInfo = [];
  try {
    var contents = fs.readFileSync('characters\\' + fileName);
    var json = JSON.parse(contents)[0];
    charInfo.push('```');
    charInfo.push('Name: ' + json.name);
    var level = '';
    for(var i = 0; i < json.class.length; i++){
      level += json.class[i] + ' ' + json.level[i] + ' ';
    }
    charInfo.push('Level: ' + level);
    charInfo.push('Race: ' + json.race);
    charInfo.push('Alignment: ' + json.alignment);
    charInfo.push('AC: ' + json.AC + '   HP: ' + json.HP + '   Hit Dice: ' + json.hitDice);
    charInfo.push('Initiative: ' + json.initiative + '   Speed: ' + json.speed + 'ft');
    var proficiency = json.proficiency;
    charInfo.push('Proficiency: ' + proficiency);
    charInfo.push('       STR DEX CON INT WIS CHA')
    var formattedStats = '';
    var stats = [];
    var saves = '';
    var mods = '';
    var statBlockLength = 4;
    for(var stat in json.stats){
      if (json.stats.hasOwnProperty(stat)) {
        formattedStats += padSpacing(json.stats[stat][0].toString(), statBlockLength);
        mods += padSpacing(calculateStatMod(json.stats[stat][0]), statBlockLength);
        stats.push(json.stats[stat][0]);
        var save = calculateStatMod(json.stats[stat][0]); 
        if(json.stats[stat][1]){
          save += proficiency;
        }
        saves += padSpacing(save, statBlockLength);
      }
    }
    charInfo.push('Stats: ' + formattedStats);
    charInfo.push('Mods : ' + mods);
    charInfo.push('Saves: ' + saves);
    for(var skill in json.skills){
      var skillTotal = 0;
      var statSpot = 0;
      switch(json.skills[skill][0]){
        case 'STR':
          statSpot = 0;
          break;
        case 'DEX':
          statSpot = 1;
          break;
        case 'CON':
          statSpot = 2;
          break;
        case 'INT':
          statSpot = 3;
          break;
        case 'WIS':
          statSpot = 4;
          break;
        case 'CHA':
          statSpot = 5;
          break;
      }
      skillTotal = calculateStatMod(stats[statSpot]);
      if(json.skills[skill][1]){
        skillTotal += proficiency;
      }
      var skillMsg = skill + ': ';
      var skillMsgLength = 17;
      skillMsg = padSpacing(skillMsg, skillMsgLength);
      charInfo.push(skillMsg + skillTotal);
    }
    
    charInfo.push('```');
    bot.sendMessage(charInfo);  
  } catch (err) {
    bot.sendMessage('Character Sheet Not Found')
    console.log(err);
  }
}

function getSpellInfo(spell, bot){
  //For the memes
  if(spell.toLowerCase() === 'za warudo'){
    spell = 'time stop';
  }
  var spellUrl = spell.replace(/\s+/g, '-').toLowerCase();
  spellUrl = spellUrl.replace('\'','-');
  spellUrl = spellUrl.replace('/','-');
  var name, school, casting_time, range, components, duration, description;
  var url = 'http://www.5esrd.com/spellcasting/all-spells/' + spellUrl.charAt(0) + '/' + spellUrl + '/';
  request(url, function(error, response, html){
    if(!error){
      var $ = cheerio.load(html);
      var spell_info = [];
      $("article[class^='spellcasting spellsa-z']").filter(function(){
        var data = $(this);
        name = data.children().eq(3).text();
        spell_info.push("__**" + name + "**__");
      });
      $(".article-content").filter(function(){
        var data = $(this);
        school = data.children().eq(1).text();
        spell_info.push('**' + school + '**');
        var focusedData = data.children().eq(2);
        var textInfo = focusedData.clone().children().remove().end().text();
        var splitInfo = textInfo.split(': ');
        casting_time = splitInfo[1];
        spell_info.push('**Casting Time**: ' + casting_time);
        range = splitInfo[2];
        spell_info.push('**Range**: ' + range);
        components = splitInfo[3];
        spell_info.push('**Components**: ' + components);  
        duration = splitInfo[4];
        spell_info.push('**Duration**: ' + duration);
        var length = data.children().length;
        for(var i = 3; i < length-2; i++){
          spell_info.push(data.children().eq(i).text());
        }
      });
    } else {
      console.log(error);
      return 'Didn\'t find any spell by that name.';
    }
    if(spell_info.length == 0){
      spell_info.push('Spell Not Found');
    }
    bot.sendMessage(spell_info);
  }); 
}

function calculateStatMod(stat){
  return Math.floor((stat - 10)/2);
}

//Dota 2 Functions
function getDotaItemInfo(item){
  var item_url = item.replace(/\s+/g, '-').toLowerCase();
  var url = 'http://www.dotabuff.com/items/' + item_url + '/';
  request(url, function(error, response, html){
    if(!error){
      var $ = cheerio.load(html);
      var name, gold, description, icon;
      $('.name').filter(function(){
        var data = $(this);
        name = data.children().first().text();
        return name;
      });
    } else {
      console.log(error);
      return 'Didn\'t find any item by that name.';
    }
  }); 
}

//Utility functions
function updateTime(user){
  user.endTime = new Date();
  var timeAFK = user.endTime.getTime()-user.startTime.getTime();
  var x = timeAFK / 1000
  user.seconds = Math.floor(x % 60);
  x /= 60
  user.minutes = Math.floor(x % 60);
  x /= 60
  user.hours = Math.floor(x % 24);
  x /= 24
  user.days = Math.floor(x);
}

function padSpacing(text, characterMax){
  var output = '';
  output += text;
  for(var i = 0; i < characterMax-text.toString().length; i++){
    output += ' ';
  }
  return output;
}

function randomNumber(maxNum){
  return Math.floor(Math.random() * maxNum);
}

function rollDie(params, bot){
  var data = params.split(' ');
  var numOfDice = data[0];
  var typeOfDice = data[1];
  var results = [];
  var total = 0;
  for(var i = 0; i < numOfDice; i++){
    var randomNum = randomNumber(typeOfDice) + 1;
    total += randomNum;
    results.push(randomNum);
  }
  bot.sendMessage('Results for ' + numOfDice + ' d' + typeOfDice + ': ' + results + '\nDice Total = ' + total);
}

//Bohan Pang

//REDO all of these
//Jeremy commands
function checkTime(message){
  //variable for the user in the message
  var userTimed = message.mentions.users.first();
  //variable for when he is found in array of users being timed
  var foundUser;

  //if the message does not contain a user
  if(userTimed == undefined){
    message.channel.sendMessage("Please declare a user after !time.");
  } 

  else {
    //check all timed users for the named user
    for(var i = 0; i < allTimedUsers.length; i++) {
      //if the named user is timed, save him for use in the function
      if(allTimedUsers[i].name === userTimed.username) {
        foundUser = allTimedUsers[i];
      }
    }
    //if that user is not found
    if(foundUser == undefined) {
      message.channel.sendMessage("User is not being timed yet.");
    }

    //otherwise print the user's time
    else {
      updateTime(foundUser);
      if (foundUser.seconds == 0) {
        message.channel.sendMessage('Stop spamming ' + foundUser.seconds + ' would never be back that fast');
      } else if (foundUser.minutes == 0) {
        message.channel.sendMessage(foundUser.name + ' has been AFK for ' + foundUser.seconds + ' seconds');
      } else if (foundUser.hours == 0 && foundUser.minutes < 10) {
        message.channel.sendMessage('Jeremy has been AFK for ' + foundUser.minutes + ' minutes and ' + foundUser.seconds + ' seconds');
      } else if (foundUser.hours == 0 && foundUser.minutes >= 10) {
        message.channel.sendMessage('<:10minutes:267176892954574848> Jeremy has been AFK for ' + foundUser.minutes + ' minutes and ' + foundUser.seconds + ' seconds <:10minutes:267176892954574848>');
      } else if (foundUser.days == 0) {
        message.channel.sendMessage('<:10minutes:267176892954574848> Jeremy has been AFK for ' + foundUser.hours + ' hours, ' + foundUser.minutes + ' minutes and ' + foundUser.seconds + ' seconds <:10minutes:267176892954574848>');
      } else {
        message.channel.sendMessage('<:10minutes:267176892954574848> Jeremy has been AFK for ' + foundUser.days + ' days, ' + foundUser.hours + ' hours, ' + foundUser.minutes + ' minutes and ' + foundUser.seconds + ' seconds <:10minutes:267176892954574848>');
      }
    } 
  }
}

function timeUser(message){
  var userTimerRunning = false;
  var userTimed = message.mentions.users.first();

  //If function wasn't passed a user, display error and exit
  if(userTimed == undefined){
    message.channel.sendMessage("Please declare a user after !time.");
    return -1;
  }

  //Check if the user is already being timed
  for(var i = 0; i < allTimedUsers.length; i++){
    if(allTimedUsers[i].name === userTimed.username) {
      userTimerRunning = true;
      foundUser = allTimedUsers[i];
    }
  }

  /*If user is not being timed, add to list of people being timed. If being timed, stop their timer and display time,
   *then remove from list of timed users.
   */
  if(userTimerRunning == false){
    message.channel.sendMessage('Starting Timer for ' + userTimed);
    var user = new timedUser(userTimed.username);
    user.startTime = new Date();
    startUser = message.author.username;
    allTimedUsers.push(user);
  } else if(userTimerRunning == true) {
    updateTime(foundUser);
    if(foundUser.seconds == 0) {
      message.channel.sendMessage("Stop spamming," + foundUser.name + " would never actually be back this fast.");
    } else if (foundUser.minutes == 0) {
      message.channel.sendMessage(foundUser.name + ' was AFK for ' + foundUser.seconds + ' seconds');
    } else if (foundUser.hours == 0 && foundUser.minutes < 10) {
      message.channel.sendMessage(foundUser.name + ' was AFK for ' + foundUser.minutes + ' minutes and ' + foundUser.seconds + ' seconds');
    } else if (foundUser.hours == 0 && foundUser.minutes >= 10) {
      message.channel.sendMessage('<:10minutes:267176892954574848> ' + foundUser.name + ' was AFK for ' + foundUser.minutes + ' minutes and ' + foundUser.seconds + ' seconds <:10minutes:267176892954574848>');
    } else if (foundUser.days == 0) {
      message.channel.sendMessage('<:10minutes:267176892954574848> ' + foundUser.name + ' was AFK for ' + foundUser.hours + ' hours, ' + foundUser.minutes + ' minutes and ' + foundUser.seconds + ' seconds <:10minutes:267176892954574848>');
    } else {
      message.channel.sendMessage('<:10minutes:267176892954574848> ' + foundUser.name + ' was AFK for ' + foundUser.days + ' days, ' + foundUser.hours + ' hours, ' + foundUser.minutes + ' minutes and ' + foundUser.seconds + ' seconds <:10minutes:267176892954574848>');
    }
    //Splice out the user we just finished the timer for
    for(var i = 0; i < allTimedUsers.length; i++){
      if(foundUser.name === allTimedUsers[i].name){
        allTimedUsers.splice(i, 1);
      }
      break;
    }
  }
  else {
    message.channel.sendMessage(userTimed + " is not being timed right now");
  }
}

// the ready event is vital, it means that your bot will only start reacting to information
// from Discord _after_ ready is emitted.
client.on('ready', () => {
  console.log('I am ready!');
});


// create an event listener for messages
client.on('message', message => {
  if (message.content === '!10-minutes') {
    message.channel.sendMessage('<:10minutes:267176892954574848> <:10minutes:267176892954574848> <:BohanW:284775760277798922>    <:10minutes:267176892954574848> <:10minutes:267176892954574848> <:10minutes:267176892954574848>\n' +
                                '<:BohanW:284775760277798922> <:10minutes:267176892954574848> <:BohanW:284775760277798922>    <:10minutes:267176892954574848> <:BohanW:284775760277798922> <:10minutes:267176892954574848>\n' + 
                                '<:BohanW:284775760277798922> <:10minutes:267176892954574848> <:BohanW:284775760277798922>    <:10minutes:267176892954574848> <:BohanW:284775760277798922> <:10minutes:267176892954574848>\n' +
                                '<:BohanW:284775760277798922> <:10minutes:267176892954574848> <:BohanW:284775760277798922>    <:10minutes:267176892954574848> <:BohanW:284775760277798922> <:10minutes:267176892954574848>\n' +
                                '<:10minutes:267176892954574848> <:10minutes:267176892954574848> <:10minutes:267176892954574848>    <:10minutes:267176892954574848> <:10minutes:267176892954574848> <:10minutes:267176892954574848>\n')
  } else if (message.content.startsWith('!check-time')) {
    checkTime(message);
  } else if (message.content.startsWith('!time')) {
    timeUser(message);
  } else if (message.content === '!time-starter') {
    message.channel.sendMessage('Last timer started by ' + startUser);
  } else if (message.content === '!commands') {
    message.channel.sendMessage('__**!10-minutes**__ - <:10minutes:267176892954574848>\n' +
                                '__**!time**__ - Start the Jeremy AFK timer. Ends the timer if it is currently active.\n' +
                                '__**!check-time**__ - Check current Jeremy AFK timer.\n' +
                                '__**!time-starter**__ - Displays name of the last person to start the timer\n' +
                                '__**!roll X Y**__ - Generate X random numbers between 1 and Y\n' +
                                '__**!spell X**__ - Look up a D&D 5E spell named X\n' +
                                '__**!sheet  X**__ - Display a D&D 5E character sheet for character named X');
  } else if (message.content.startsWith('!dota item ')) {
    var param = message.content.replace('!dota item ', '');
    var msg = getDotaItemInfo(param);
    message.channel.sendMessage('Item Name: ' + msg);
  } else if (message.content.startsWith('!roll ')) {
    var param = message.content.replace('!roll ', '');
    var results = rollDie(param, message.channel);
  } else if (message.content.startsWith('!spell ')) {
    var param = message.content.replace('!spell ', '');
    var msg = getSpellInfo(param, message.channel);
  } else if (message.content.startsWith('!sheet ')) {
    var param = message.content.replace('!sheet ', '');
    var msg = getCharacterSheet(param, message.channel);
  }
});

// log our bot in
client.login(token);
