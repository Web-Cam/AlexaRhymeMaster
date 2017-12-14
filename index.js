/*
	Template/ Example code: Benjamin Snoha /
	Revision : Web-Cam
	Title: Rhyme Gen
*/

'use strict';
var Alexa = require("alexa-sdk");
var request = require('request');//for the api calls
var APP_ID = '';
var score = 0; // clear this after every end, since lambda keeps this for a few mins.
var tries = 0;
var wordlist = [];// the arrays to hold data for alexareturn()
var debug = [];
var pusher = 0;
var alexaword = []; 
var fallback = [];
var level = "free"; // set easy as default
var allwords = []; // the array for all the words that can be used for the session. 
var start = true;

var languageStrings = {
    "en": {
        "translation": {
            "SKILL_NAME": "Rhyme Generator",
            "HELP_MESSAGE": "Just say any word ................................. then I will rhyme it ...................................................next say a rhyme for that word ......................................Dont say any words I said though.......................Freemode will let you say anything................................ while hard is for masters only! ............. Now .. say a word to begin",
            "HELP_REPROMPT": "Just try to say a word like Boat!",
            "STOP_MESSAGE": "Goodbye!"
        }
    }
};


exports.handler = function(event, context, callback) {
    var alexa = Alexa.handler(event, context);
    alexa.APP_ID = APP_ID;
    alexa.resources = languageStrings;
    alexa.registerHandlers(handlers);
    alexa.execute();
};

var handlers = {
'yes': function() {
	killalexa();
	this.emit(':ask',"Ok! lets play again say another word to begin!");
	},
'no': function() {
	killalexa();
	this.emit(':tell',"Ok! Thanks for playing!");
	},
'free': function() {
	killalexa();
	level = "free";
	this.emit(':ask',"Ok, level set to freemode, now say a word to begin or ask for help for instructions.");
	},
'easy': function() {
	killalexa();
	level = "easy";
	this.emit(':ask',"Ok, level set to easy, now say a word to begin or ask for help for instructions.");
	},
'med': function() {
	killalexa();
	level = "med";
	this.emit(':ask',"Ok, level set to medium, now say a word to begin or ask for help for instructions.");
	},	
'hard': function() {
	killalexa();
	level = "hard"
	this.emit(':ask',"Ok, level set to hard, now say a word to begin or ask for help for instructions.");
    },
'WhatAmI': function() {
	if (fallback.length == 0) {this.emit(':ask',"You didnt say a word yet!" );}
	else {this.emit(':ask',"You are finding words that rhyme with ...." + fallback[fallback.length]);}
    },
'Test': function() {
	this.emit(':ask',debug[debug.length-1] + "   " + allwords.includes(debug[debug.length-1]) + allwords +  pusher);
    },
	'Testa': function() {
      //if (alexareturn() === true)
		 // this.emit(':ask', "true")
	 this.emit(':ask',"hi")
    },
'kill': function(){ // change to reset
	killalexa();
	this.emit(':ask',"success")
},
   'LaunchRequest': function() {
        killalexa();
		this.emit(':ask', "Welcome to Rhyme Master. Here are the rules, you say a word and I will find a rhyme. If you cant think of a rhyme or say something that I said you lose! Now select your level, say freemode ....easy ....Medium .....Or .....hard!");
        this.emit('GetNewWordIntent');
		
    },
	'EndGameUser': function() {
        this.emit(':ask', "I win! Better luck next time try to beat your score of " + score + "Would you like to play again ?"); // Pulled ending words instead of calling unhandled, now call this instead.. Put call words in utterances
		killalexa();
   },
'GetNewWordIntent': function() {
        var wordInput = this.event.request.intent.slots.customWord.value;
		
		var RNG = Math.floor(Math.random() * 25);
        if (wordInput == null || wordInput === "undefined" || wordInput == '') { //Alexa doesnt understand the word, so User loses.
            this.emit('Unhandled'); //send to unhandled handler
        } else {
           //if (level = "easy"){wordcheck()= true;}
		   if (wordcheck(wordInput) === false){this.emit(':ask','please say a word that rhymes with the previous words','Time is almost up.')}
		   // Create speech output
            getNextWord(wordInput, (speechOutput) => {
                if (speechOutput == '') {
                    this.emit('Unhandled');
                } else {
					if (RNG == 9){ 
					this.emit(':ask', "Hmmmm I cant think of any rhymes Congratulations.......... you win........ with a score of...." + score + "want to play again?");
					killalexa();
					}
					else {
						if(alexareturn()){// make a switch function
						tries += 1;
						if (tries > 1){
						this.emit(':ask',"I already said that word try again? for example say ...... " + allwords[wordlistRan()], 'time is almost up Think of a word' );
						tries = 0; // reset tries assume they will use that
						alexaword.pop();
						}
						else {this.emit(':ask',"I already said that word try again?");
						alexaword.pop();
						}}
						
						if(comparr()){
						tries += 1;
						if (tries > 1){
						this.emit(':ask',"You have said that word pick another? ... for example say ......" + allwords[wordlistRan()], 'time is almost up....... you got this');
						wordlist.pop();
						tries = 0;
						}
						else {this.emit(':ask',"I already said that word try again?", 'Dont give up! just say another word');
						wordlist.pop();
						}}
						if(compalex()){
						fallback.pop();
						getNextWord(fallback, (speechOutput) => {
						if(speechOutput == ''){
							this.emit('Unhandled');
								}
								else{
							this.emit(':ask', speechOutput );
									}
							});	

						}
							
					else{score += 1
                    alexaword.push(speechOutput);
					fallback.push(speechOutput);
                    this.emit(':ask', speechOutput );
					
					}
                
                }
				}
            });
        }
    },
    'AMAZON.HelpIntent': function() {
        var speechOutput = this.t("HELP_MESSAGE");
        var reprompt = this.t("HELP_REPROMPT");
        this.emit(':ask', speechOutput, reprompt);
    },
    'AMAZON.CancelIntent': function() {
        this.emit(':tell', this.t("STOP_MESSAGE"));
    },
    'AMAZON.StopIntent': function() {
        this.emit(':tell', this.t("STOP_MESSAGE"));
    },
    'Unhandled': function() {
        console.log("UNHANDLED");
        //If the users sentence really made no sense at all, then just choose a random word to finish with.
        getNextWord("yellow", (speechOutput) => {
            if (speechOutput == '') {
                this.emit('Unhandled');
            } else {
                this.emit(':ask', " There are no rhymes for that word ....You Lose I win your score was " + score +  ".... Try Again? " );
				killalexa();
            }
        });
    }
};

//Gets the rhyme for a single word
function getNextWord(contextWord, _callback) {
	
	var options = {
        url: 'https://api.datamuse.com/words?rel_rhy=' + levelSel(contextWord) // if no max is set, it tends to return off topic words like boat rhymes with right to vote.
    };

trimArray();
    request(options, (error, response, body) => {
        if (!error && response.statusCode == 200) {
            //Get the info
            var info = JSON.parse(body);
            
			var potentialWord = [];
            //Search it to make sure the syllable count is the same
            if (info) {
                for (var i = 0; i < info.length; i++) {
                    //We found a rhyme, add to potential's array
                    potentialWord.push(info[i].word);
					if (pusher == 0){
					allwords.push(info[i].word);
					}
					
                }
				pusher +=1;
                //Return random one from list of potential rhymes
                if (_callback) {
                    var randIndex = Math.floor(Math.random() * (potentialWord.length - 1));
                    if (potentialWord[randIndex]) {
                   
							
						return _callback(potentialWord[randIndex]);
					 
                    }
                }
            }
        } else {
            console.log("Error making request: " + error);
        }

        if (_callback) {
            return _callback('');
		
        }
    });
}

function alexareturn() { // a check to see if any word alexa said has been used
 var same = false
 console.log(alexaword + wordlist);
	for (var i = 0; i < alexaword.length; i++) {
        for(var j = 0; j < wordlist.length; j++)
        {
            if(alexaword[i].indexOf(wordlist[j]) > -1)
            {
				same = true;
				break;
            }
        }
    }
if (same){return true;}
else{return false;}

	
	}


function killalexa() // kills the globals 
{
wordlist = [];
alexaword = []; 
// the arrays to hold data for alexareturn()
start = true;
fallback = [];
allwords = [];
score = 0;
tries = 0;
pusher = 0;
}	


function comparr(){
var same = false;
for (var i = 0; i < wordlist.length; i++) {
  for (var k = i + 1; k < wordlist.length; k++) {
        if (wordlist[i] == wordlist[k]) {
            same = true;
			break;
        }
    }
}
	if (same){return true;}
		else{return false;}
	}	
	

function compalex(){ // word to check alexa word is in array
var same = false;
for (var i = 0; i < alexaword.length; i++) {
  for (var k = i + 1; k <= alexaword.length; k++) {
        if (alexaword[i] == alexaword[k]) {
            same = true;
			break;
        }
    }
}
	if (same){return true;}
		else{return false;}
	}	
	
function repeater(){
			getNextWord(fallback, (speechOutput) => {
			if(speechOutput == ''){
				this.emit('Unhandled');
			}
			else{
				this.emit(':ask', speechOutput );
			}
		});	
	
	
}
function wordcheck(wordInput){ // function that will check if the word a user said is in the array.
debug.push(wordInput);	
console.log(wordInput + "   " + allwords);
if (level === "free" || level === "easy" ){return true;}
else{
if (start){
start = false;
return true;
}
else{ 
//for (var i = 0; i < allwords.length; i++) {
        return allwords.includes(wordInput[wordInput.length-1]);
		//if ( allwordswordInput[wordInput.length-1] == allwords[i]) {
            //same = true;
			//break; allwords.includes(debug[debug.length-1])
        //}
    //}	
	
	//if (same){return false;}
		//else{return true;}
}
}
}
function trimArray()
{
    for(var i=0;i<allwords.length;i++)
    {
        allwords.map((str) => str.replace(/\s/g, ''));
    }

}
function levelSel(contextWord)
{
switch(level){
	case "free":
	return contextWord
	case "easy":
	return contextWord + '&nry=' + contextWord + '&max=300'
	break;
	case "med":
	return contextWord + '&nry=' + contextWord + '&max=50'
	break;
	case "hard":
	return contextWord
	break;
	default:
	return contextWord + '&nry=' + contextWord + '&max=300'
}

}
function wordlistRan(){
var i = 1;
var num = allwords.length - i ;
i++;
return num;
	
}
