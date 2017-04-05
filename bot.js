/*
  Author: Colton Howe
  Version: 0.1
  Date: Feb 16th, 2017
  Description: Initial implementation of Timing Bot
*/

// import the discord.js module
const Discord = require('discord.js');
var express = require('express');
var fs = require('fs');
var request = require('request');
var cheerio = require('cheerio');
var app = express();

var startTime;
var endTime;
var timing = 0;
var startTime = 0;
var endTime = 0;
var seconds = 0;
var minutes = 0;
var hours = 0;
var days = 0;

// create an instance of a Discord Client, and call it bot
const client = new Discord.Client();
const token = 'MjgxOTI2OTY5MjYyODY2NDQy.C4ifmQ.CK45dWaoCIsPGYIANTufz1ee5DU';

function randomNumber(maxNum){
  return Math.floor(Math.random() * maxNum);
}

function rollDie(params){
  var data = params.split(' ');
  var numOfDice = data[0];
  var typeOfDice = data[1];
  var results = [];
  for(var i = 0; i < numOfDice; i++){
    results.push(randomNumber(typeOfDice) + 1);
  }
  return results;
}

function calculateStatMod(stat){
  return Math.floor((stat - 10)/2);
}

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
      level += json.class[i] + ' ' + json.level[i] + " ";
    }
    charInfo.push('Level: ' + level);
    charInfo.push('Race: ' + json.race);
    charInfo.push('Alignment: ' + json.alignment);
    charInfo.push('AC: ' + json.AC + '   HP: ' + json.HP + '   Hit Dice: ' + json.hitDice);
    charInfo.push('Initiative: ' + json.initiative + '   Speed: ' + json.speed + 'ft');
    var proficiency = json.proficiency;
    charInfo.push('Proficiency: ' + proficiency);
    charInfo.push('       STR DEX CON INT WIS CHA')
    var formattedStats = "";
    var modifiers = "";
    var stats = [];
    var saves = "";
    for(var stat in json.stats){
      if (json.stats.hasOwnProperty(stat)) {
        if(json.stats[stat].toString().length == 1){
          formattedStats += json.stats[stat][0] + "   ";
          modifiers += calculateStatMod(json.stats[stat][0]) + "  "; 
        } else {
          formattedStats += json.stats[stat][0] + "  ";
          modifiers += calculateStatMod(json.stats[stat][0]) + "   "; 
        }
        stats.push(json.stats[stat][0]);
        var save = calculateStatMod(json.stats[stat][0]); 
        if(json.stats[stat][1]){
          save += proficiency;
        }
        if(save < 0){
          saves += save + "  ";
        } else {
          saves += save + "   ";
        }
      }
    }
    charInfo.push('Stats: ' + formattedStats);
    charInfo.push('Mods : ' + modifiers);
    charInfo.push('Saves: ' + saves);
    for(var skill in json.skills){
      var statTotal = 0;
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
      statTotal = calculateStatMod(stats[statSpot]);
      if(json.skills[skill][1]){
        statTotal += proficiency;
      }
      var statMsg = skill + ': ';
      var statMsgLength = 17-statMsg.length;
      for(var i = 0; i < statMsgLength; i++){
        statMsg += ' ';
      }
      charInfo.push(statMsg + statTotal);
    }
    
    charInfo.push('```');
    bot.sendMessage(charInfo);  
  } catch (err) {
    bot.sendMessage('Character Sheet Not Found')
  }
}

function getSpellInfo(spell, bot){
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
        spell_info.push("**" + school + "**");
        var focusedData = data.children().eq(2);
        var textInfo = focusedData.clone().children().remove().end().text();
        var splitInfo = textInfo.split(': ');
        casting_time = splitInfo[1];
        spell_info.push("**Casting Time**: " + casting_time);
        range = splitInfo[2];
        spell_info.push("**Range**: " + range);
        components = splitInfo[3];
        spell_info.push("**Components**: " + components);  
        duration = splitInfo[4];
        spell_info.push("**Duration**: " + duration);
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
function updateTime(){
  endTime = new Date();
  var timeAFK = endTime.getTime()-startTime.getTime();
  var x = timeAFK / 1000
  seconds = Math.floor(x % 60);
  x /= 60
  minutes = Math.floor(x % 60);
  x /= 60
  hours = Math.floor(x % 24);
  x /= 24
  days = Math.floor(x);
}

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
      startTime = new Date();
      timing = 1;
    } else {
      updateTime();
      if(seconds == 0) {
        message.channel.sendMessage("Stop spamming, Jeremy would never actually be back this fast.");
      } else if (minutes == 0) {
        message.channel.sendMessage('Jeremy was AFK for ' + seconds + ' seconds');
      } else if (hours == 0 && minutes < 10) {
        message.channel.sendMessage('Jeremy was AFK for ' + minutes + ' minutes and ' + seconds + ' seconds');
      } else if (hours == 0 && minutes >= 10) {
        message.channel.sendMessage('<:10minutes:267176892954574848> Jeremy was AFK for ' + minutes + ' minutes and ' + seconds + ' seconds <:10minutes:267176892954574848>');
      } else if (days == 0) {
        message.channel.sendMessage('<:10minutes:267176892954574848> Jeremy was AFK for ' + hours + ' hours, ' + minutes + ' minutes and ' + seconds + ' seconds <:10minutes:267176892954574848>');
      } else {
        message.channel.sendMessage('<:10minutes:267176892954574848> Jeremy was AFK for ' + days + ' days, ' + hours + ' hours, ' + minutes + ' minutes and ' + seconds + ' seconds <:10minutes:267176892954574848>');
      }
      timing = 0;
    }
  } else if (message.content === '!10-minutes') {
    message.channel.sendMessage('<:10minutes:267176892954574848> <:10minutes:267176892954574848> <:BohanW:284775760277798922>    <:10minutes:267176892954574848> <:10minutes:267176892954574848> <:10minutes:267176892954574848>\n' +
                                '<:BohanW:284775760277798922> <:10minutes:267176892954574848> <:BohanW:284775760277798922>    <:10minutes:267176892954574848> <:BohanW:284775760277798922> <:10minutes:267176892954574848>\n' + 
                                '<:BohanW:284775760277798922> <:10minutes:267176892954574848> <:BohanW:284775760277798922>    <:10minutes:267176892954574848> <:BohanW:284775760277798922> <:10minutes:267176892954574848>\n' +
                                '<:BohanW:284775760277798922> <:10minutes:267176892954574848> <:BohanW:284775760277798922>    <:10minutes:267176892954574848> <:BohanW:284775760277798922> <:10minutes:267176892954574848>\n' +
                                '<:10minutes:267176892954574848> <:10minutes:267176892954574848> <:10minutes:267176892954574848>    <:10minutes:267176892954574848> <:10minutes:267176892954574848> <:10minutes:267176892954574848>\n')
  } else if (message.content === '!check-time') {
    if(timing == 0){
      message.channel.sendMessage('We aren\'t waiting on Jeremy...yet.');
    } else {
      updateTime();
      if (minutes == 0) {
        message.channel.sendMessage('Jeremy has been AFK for ' + seconds + ' seconds');
      } else if (hours == 0 && minutes < 10) {
        message.channel.sendMessage('Jeremy has been AFK for ' + minutes + ' minutes and ' + seconds + ' seconds');
      } else if (hours == 0 && minutes >= 10) {
        message.channel.sendMessage('<:10minutes:267176892954574848> Jeremy has been AFK for ' + minutes + ' minutes and ' + seconds + ' seconds <:10minutes:267176892954574848>');
      } else if (days == 0) {
        message.channel.sendMessage('<:10minutes:267176892954574848> Jeremy has been AFK for ' + hours + ' hours, ' + minutes + ' minutes and ' + seconds + ' seconds <:10minutes:267176892954574848>');
      } else {
        message.channel.sendMessage('<:10minutes:267176892954574848> Jeremy has been AFK for ' + days + ' days, ' + hours + ' hours, ' + minutes + ' minutes and ' + seconds + ' seconds <:10minutes:267176892954574848>');
      }
    }
  } else if (message.content === '!commands-to-troll-jeremy') {
    message.channel.sendMessage('__**!10-minutes**__ - <:10minutes:267176892954574848>\n' +
                                '__**!time**__ - Start the Jeremy AFK timer. Ends the timer if it is currently active.\n' +
                                '__**!check-time**__ - Check current Jeremy AFK timer.\n' +
                                '__**!roll X Y**__ - Generate X random numbers between 1 and Y\n' +
                                '__**!spell X**__ - Look up a D&D 5E spell named X');
  } else if (message.content.startsWith('!dota item ')) {
    var param = message.content.replace('!dota item ', '');
    var msg = getDotaItemInfo(param);
    message.channel.sendMessage('Item Name: ' + msg);
  } else if (message.content.startsWith('!roll ')) {
    var param = message.content.replace('!roll ', '');
    var results = rollDie(param);
    var splitMsg = param.split(' ');
    var numOfDice = splitMsg[0];
    var typeOfDice = splitMsg[1];
    message.channel.sendMessage('Results for ' + numOfDice + ' d' + typeOfDice + ': ' + results);
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
