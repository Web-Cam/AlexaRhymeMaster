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
var wordlist = [];// the arrays to hold data for alexareturn()
var alexaword = []; 
var fallback = [];
var level = "easy"; // set easy as default
var allwords = []; // the array for all the words that can be used for the session. 
var start = true;

var languageStrings = {
    "en": {
        "translation": {
            "SKILL_NAME": "Rhyme Generator",
            "HELP_MESSAGE": "If you say any word, then you think of a word that rhymes with that word",
            "HELP_REPROMPT": "What can I help you with?",
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
'easy': function() {
	level = "easy";
	this.emit(':ask',"Ok, level set to easy, now say a word to begin or ask for help for instructions.");
	},
'med': function() {
	level = "med";
	this.emit(':ask',"Ok, level set to medium, now say a word to begin or ask for help for instructions.");
	},	
'hard': function() {
	level = "hard"
	this.emit(':ask',"Ok, level set to hard, now say a word to begin or ask for help for instructions.");
    },

'Test': function() {
	this.emit(':ask',allwords);
    },
	'Testa': function() {
      //if (alexareturn() === true)
		 // this.emit(':ask', "true")
	 this.emit(':ask',compalex())
    },
'kill': function(){ // change to reset
	killalexa();
	this.emit(':ask',"success")
},
   'LaunchRequest': function() {
        killalexa();
		this.emit(':ask', "Welcome to Rhyme Master. Here are the rules, you say a word and I will find a rhyme. If you cant think of a rhyme or say something that I said you lose! Now select your level, say easy Medium Or hard!");
        this.emit('GetNewWordIntent');
		
    },
	'EndGameUser': function() {
        this.emit(':tell', "I win! Better luck next time try to beat your score of " + score); // Pulled ending words instead of calling unhandled, now call this instead.. Put call words in utterances
		killalexa();
   },
'GetNewWordIntent': function() {
        var wordInput = this.event.request.intent.slots.customWord.value;
		
		var RNG = Math.floor(Math.random() * 25);
        if (wordInput == null || wordInput === "undefined" || wordInput == '') { //Alexa doesnt understand the word, so User loses.
            this.emit('Unhandled'); //send to unhandled handler
        } else {
           if (wordcheck(wordInput)){this.emit(':ask','please say a word that rhymes with the previous words')}
		   // Create speech output
            getNextWord(wordInput, (speechOutput) => {
                if (speechOutput == '') {
                    this.emit('Unhandled');
                } else {
					if (RNG == 9){ 
					this.emit(':tell', "Hmmmm I cant think of any rhymes Congratulations.......... you win........ with a score of...." + score);
					killalexa();
					}
					else {
						if(alexareturn()){
						this.emit(':ask',"I already said that word try again?");
						alexaword.pop();
						}
						if(comparr()){
						this.emit(':ask',"You have said that word pick another?");
						}
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
                this.emit(':tell', " There are no rhymes for that word ....You Lose I win your score was " + score +  ".... Try Again? " );
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
wordlist.push(contextWord) ;
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
					allwords.push(info[i].word);
                }

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
 var rhyme = false
 console.log(alexaword + wordlist );
	for (var i = 0; i < alexaword.length; i++) {
        for(var j = 0; j < wordlist.length; j++)
        {
            if(alexaword[i].indexOf(wordlist[j]) > -1)
            {
				rhyme = true;
				break;
            }
        }
    }
if (rhyme){return true;}
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
	

function compalex(){ // word to check alexa
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
var same = false;	
if (start){
start = false;
return false;
}
else{ 
for (var i = 0; i < allwords.length; i++) {
        if ( wordInput == allwords[i]) {
            same = true;
			break;
        }
    }	
	
	if (same){return false;}
		else{return true;}
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
