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

function getDotaItemInfo(item){
  var item_url = item.replace(/\s+/g, '-').toLowerCase();
  var url = 'http://www.dotabuff.com/items/' + item_url + '/';
  console.log(url);
  request(url, function(error, response, html){
    console.log(html);
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
  }  else if (message.content === '!bohan') {
      sleep(1);
      message.channel.sendMessage('Jeremy is lying. Its a conspiracy!');
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
                                  '__**!check-time**__ - Check current Jeremy AFK timer.\n');
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
  }
});

// log our bot in
client.login(token);
