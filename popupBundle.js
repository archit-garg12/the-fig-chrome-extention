(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
'use strict'

module.exports = stemmer

// Standard suffix manipulations.
var step2list = {
  ational: 'ate',
  tional: 'tion',
  enci: 'ence',
  anci: 'ance',
  izer: 'ize',
  bli: 'ble',
  alli: 'al',
  entli: 'ent',
  eli: 'e',
  ousli: 'ous',
  ization: 'ize',
  ation: 'ate',
  ator: 'ate',
  alism: 'al',
  iveness: 'ive',
  fulness: 'ful',
  ousness: 'ous',
  aliti: 'al',
  iviti: 'ive',
  biliti: 'ble',
  logi: 'log'
}

var step3list = {
  icate: 'ic',
  ative: '',
  alize: 'al',
  iciti: 'ic',
  ical: 'ic',
  ful: '',
  ness: ''
}

// Consonant-vowel sequences.
var consonant = '[^aeiou]'
var vowel = '[aeiouy]'
var consonants = '(' + consonant + '[^aeiouy]*)'
var vowels = '(' + vowel + '[aeiou]*)'

var gt0 = new RegExp('^' + consonants + '?' + vowels + consonants)
var eq1 = new RegExp(
  '^' + consonants + '?' + vowels + consonants + vowels + '?$'
)
var gt1 = new RegExp('^' + consonants + '?(' + vowels + consonants + '){2,}')
var vowelInStem = new RegExp('^' + consonants + '?' + vowel)
var consonantLike = new RegExp('^' + consonants + vowel + '[^aeiouwxy]$')

// Exception expressions.
var sfxLl = /ll$/
var sfxE = /^(.+?)e$/
var sfxY = /^(.+?)y$/
var sfxIon = /^(.+?(s|t))(ion)$/
var sfxEdOrIng = /^(.+?)(ed|ing)$/
var sfxAtOrBlOrIz = /(at|bl|iz)$/
var sfxEED = /^(.+?)eed$/
var sfxS = /^.+?[^s]s$/
var sfxSsesOrIes = /^.+?(ss|i)es$/
var sfxMultiConsonantLike = /([^aeiouylsz])\1$/
var step2 = /^(.+?)(ational|tional|enci|anci|izer|bli|alli|entli|eli|ousli|ization|ation|ator|alism|iveness|fulness|ousness|aliti|iviti|biliti|logi)$/
var step3 = /^(.+?)(icate|ative|alize|iciti|ical|ful|ness)$/
var step4 = /^(.+?)(al|ance|ence|er|ic|able|ible|ant|ement|ment|ent|ou|ism|ate|iti|ous|ive|ize)$/

// Stem `value`.
// eslint-disable-next-line complexity
function stemmer(value) {
  var firstCharacterWasLowerCaseY
  var match

  value = String(value).toLowerCase()

  // Exit early.
  if (value.length < 3) {
    return value
  }

  // Detect initial `y`, make sure it never matches.
  if (
    value.charCodeAt(0) === 121 // Lowercase Y
  ) {
    firstCharacterWasLowerCaseY = true
    value = 'Y' + value.slice(1)
  }

  // Step 1a.
  if (sfxSsesOrIes.test(value)) {
    // Remove last two characters.
    value = value.slice(0, value.length - 2)
  } else if (sfxS.test(value)) {
    // Remove last character.
    value = value.slice(0, value.length - 1)
  }

  // Step 1b.
  if ((match = sfxEED.exec(value))) {
    if (gt0.test(match[1])) {
      // Remove last character.
      value = value.slice(0, value.length - 1)
    }
  } else if ((match = sfxEdOrIng.exec(value)) && vowelInStem.test(match[1])) {
    value = match[1]

    if (sfxAtOrBlOrIz.test(value)) {
      // Append `e`.
      value += 'e'
    } else if (sfxMultiConsonantLike.test(value)) {
      // Remove last character.
      value = value.slice(0, value.length - 1)
    } else if (consonantLike.test(value)) {
      // Append `e`.
      value += 'e'
    }
  }

  // Step 1c.
  if ((match = sfxY.exec(value)) && vowelInStem.test(match[1])) {
    // Remove suffixing `y` and append `i`.
    value = match[1] + 'i'
  }

  // Step 2.
  if ((match = step2.exec(value)) && gt0.test(match[1])) {
    value = match[1] + step2list[match[2]]
  }

  // Step 3.
  if ((match = step3.exec(value)) && gt0.test(match[1])) {
    value = match[1] + step3list[match[2]]
  }

  // Step 4.
  if ((match = step4.exec(value))) {
    if (gt1.test(match[1])) {
      value = match[1]
    }
  } else if ((match = sfxIon.exec(value)) && gt1.test(match[1])) {
    value = match[1]
  }

  // Step 5.
  if (
    (match = sfxE.exec(value)) &&
    (gt1.test(match[1]) ||
      (eq1.test(match[1]) && !consonantLike.test(match[1])))
  ) {
    value = match[1]
  }

  if (sfxLl.test(value) && gt1.test(value)) {
    value = value.slice(0, value.length - 1)
  }

  // Turn initial `Y` back to `y`.
  if (firstCharacterWasLowerCaseY) {
    value = 'y' + value.slice(1)
  }

  return value
}

},{}],2:[function(require,module,exports){
// Copyright 2018 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

'use strict';

const stemmer = require("stemmer");
let url = "";
document.addEventListener('DOMContentLoaded', function() {
    var link = document.getElementById('myButton');
    link.addEventListener('click', function() {
        window.open(url);
    });
});

function getTags(callback) {
    // Set up our HTTP request
    var xhr = new XMLHttpRequest();

    // Setup our listener to process completed requests
    xhr.onload = function () {

        // Process our return data
        if (xhr.status >= 200 && xhr.status < 300) {
            // What do when the request is successful
            callback(JSON.parse(xhr.responseText));
        } else {
            // What do when the request fails
            console.log('The request failed!');
        }

    };
    // Create and send a GET request
    // The first argument is the post type (GET, POST, PUT, DELETE, etc.)
    // The second argument is the endpoint URL
    xhr.open('GET', 'https://ethic-scoring-server.herokuapp.com/api/shopifyProduct/allTags');
    xhr.send();
}

function getBars(productId){

	var barStyle = new XMLHttpRequest();

	barStyle.onload = function(){

		if (barStyle.status >= 200 && barStyle.status < 300){

			let styles = JSON.parse(barStyle.responseText);
			console.log(styles);

			for (const catKey of Object.keys(styles.scores.normalizedScore)) {
				const doesNotApply = '<p style="font-size: 14px;font-weight:500;">This Category Does Not Apply To This Product</p>'
				if (styles.scores.possibleScore[catKey] == 0) {
				// TODO: Make this a NA somehow
				// $(doesNotApply).insertAfter(`.${catKey}-container p`)
				// $(`.${catKey}-container .score-progress-bar-normal`).css('display', 'none')
				// cnosole.log("ASDFASDFSDAF");
				} else {
					let myElement = document.getElementsByClassName(catKey + "-greenbar")[0];
					let numString = Math.floor(styles.scores.defaultScore[catKey] / styles.scores.possibleScore[catKey] * 100).toString() + "%";
					myElement.style.width = numString;
				}


			}

			let myElement = document.getElementsByClassName("avg-greenbar")[0];
			console.log(JSON.stringify(styles["ethicGrade"]));
			console.log(styles);
			let numString = Math.floor(styles["scores"]["ethicScore"] / 100 * 100).toString() + "%";
			myElement.style.width = numString;

		}
	};

	barStyle.open('GET', 'https://ethic-scoring-server.herokuapp.com/api/shopifyproduct/score/' + productId);
	barStyle.setRequestHeader("Content-type", "application/json");
	barStyle.send();
}

function getProductFigScores(products, callback)
{
	let productIds = products.map(p => p.id);
	var xhr = new XMLHttpRequest();
	xhr.onload = function () {

		// Process our return data
		if (xhr.status >= 200 && xhr.status < 300) {
			let figScores = JSON.parse(xhr.responseText);
			
			console.log(products);
			console.log(figScores["scores"]);
		  	let items = Object.keys(figScores["scores"]).map(function(key) {
    			return [key, figScores["scores"][key]["scores"]["ethicScore"]];
  			});
			// Sort the array based on the second element
			items.sort(function(first, second) {
				return second[1] - first[1];
			});	
			
			
			console.log(items[0][0]);
			var product;
			for (var i = 0; i < products.length; i++){
				if (products[i]["id"] == parseInt(items[0][0])){
					product = products[i];
					break;
				}
			}

			if (items.length > 0){
				message.innerText = product["title"];
				url = "https://thefutureisgood.co/products/" + product["handle"];
				console.log(url);
				vendor.innerText = "Sold By: " + product["vendor"];
				productPrice.innerText = "Price: $" + product["variants"][0]["price"];
				let imgURL = product["image"]["src"];
				picture.innerHTML = "<img src=\"" + imgURL + "\">";
				callback(product["id"].toString());
				
			      
			}
			else{
				message.innerText = "";
				vendor.innerText = "";
			}
			// console.log(products[parseInt(items[0][0])]);
			console.log("archie");
			console.log(product);

		} else {
			console.log("test")
		}
  
	};

	xhr.open('POST', 'https://ethic-scoring-server.herokuapp.com/api/shopifyProduct/score');
	xhr.setRequestHeader("Content-type", "application/json");
	xhr.send(JSON.stringify({idList: productIds }));
	

	
		// method: 'GET',
		// 	      url: 'https://ethic-scoring-server.herokuapp.com/api/shopifyproduct/score/4618233184321',
		// 	      accepts: 'application/json',
		// 	      success: res => {
		// 	        console.log("asdfsadf");
		// 	        document.getElementById("vendor").innerText = res;
		// 	        const doesNotApply = '<p style="font-size: 14px;font-weight:500;">This Category Does Not Apply To This Product</p>'
		// 	        $('.avg-greenbar').css('width', `${Math.floor(res.scores.ethicScore)}%`)
			        // for (const catKey of Object.keys(res.scores.normalizedScore)) {
			        //   if (res.scores.possibleScore[catKey] == 0) {
			        //     // TODO: Make this a NA somehow
			        //     $(doesNotApply).insertAfter(`.${catKey}-container p`)
			        //     $(`.${catKey}-container .score-progress-bar-normal`).css('display', 'none')
			        //     cnosole.log("ASDFASDFSDAF");
			        //   } else {
			        //     $(`.${catKey}-greenbar`).css('width', `${Math.floor(res.scores.defaultScore[catKey] / res.scores.possibleScore[catKey] * 100)}%`)
			        //     console.log("WER");
		// 	          } 
  //       			}
  //     			}
    		
	// Create and send a GET request
	// The first argument is the post type (GET, POST, PUT, DELETE, etc.)
	// The second argument is the endpoint URL
	
	

}
// {
// 	let productIds = products.map(p => p.id);
// 	var xhr = new XMLHttpRequest();
// 	xhr.onload = function () {

// 		// Process our return data
// 		if (xhr.status >= 200 && xhr.status < 300) {
// 			let figScores = JSON.parse(xhr.responseText);
			
// 			console.log(products);
// 			console.log(figScores["scores"]);
// 		  	let items = Object.keys(figScores["scores"]).map(function(key) {
//     			return [key, figScores["scores"][key]["scores"]["ethicScore"]];
//   			});
// 			// Sort the array based on the second element
// 			items.sort(function(first, second) {
// 				return second[1] - first[1];
// 			});	
			
			
// 			console.log(items[0][0]);
// 			var product;
// 			for (var i = 0; i < products.length; i++){
// 				if (products[i]["id"] == parseInt(items[0][0])){
// 					product = products[i];
// 					break;
// 				}
// 			}

// 			if (items.length > 0){
// 				message.innerText = product["title"];
// 				vendor.innerText = "Sold By: " + product["vendor"];
// 				productScore.innerText = "Fig Score: " + items[0][1].toFixed(2);
// 				productPrice.innerText = "Price: $" + product["variants"][0]["price"];
// 			}
// 			else{
// 				message.innerText = "";
// 				vendor.innerText = "";
// 			}
// 			// console.log(products[parseInt(items[0][0])]);
// 			console.log(product);

// 		} else {
// 			console.log("test")
// 		}
  
// 	};
// 	// Create and send a GET request
// 	// The first argument is the post type (GET, POST, PUT, DELETE, etc.)
// 	// The second argument is the endpoint URL
// 	xhr.open('POST', 'https://ethic-scoring-server.herokuapp.com/api/shopifyProduct/score');
// 	xhr.setRequestHeader("Content-type", "application/json");
// 	xhr.send(JSON.stringify({idList: productIds }));
// }

function button(){
	console.log("tasdfasdf");
}


function stemTags(tags, stemmedSource, callback) {
  let finalTagList = {};
  let stemToReal = {};
  let keywordToTagSplitBySpace = {};
  const STOP_WORDS = new Set(['which', 'my', 'all', "when's", 'the', "you'd", 'from', 'be', 'down', 'until', 'by', 'only', "we're",
              "couldn't", 'your', 'her', 'should', 'but', 'at', 'having', 'ours', 'doing', "who's", 'during', "i've",
              'those', 'as', 'myself', 'than', 'himself', "i'm", 'very', 'this', "we'd", 'them', 'ourselves', "doesn't",
              'is', "we'll", "what's", 'had', 'there', "there's", 'a', 'yours', "he's", 'with', "you'll", 'these', 'does',
              'into', 'not', "that's", "hadn't", "hasn't", "it's", 'she', "why's", 'me', 'against', 'yourselves', 'it',
              "you're", "he'll", "here's", 'further', 'in', 'own', "i'll", "shouldn't", "they've", "aren't", 'do', 'itself',
              "wasn't", 'then', "shan't", 'again', 'i', 'were', 'why', 'through', 'more', 'when', "where's", 'once', 'being',
              'who', "she'll", 'under', 'no', "can't", 'other', "they'll", 'they', 'below', "won't", 'each', 'themselves',
              'would', 'on', 'both', 'while', 'hers', 'herself', 'cannot', "she's", 'nor', 'over', 'where', 'you', "you've",
              "how's", 'up', 'how', 'ought', "they'd", 'am', 'what', 'whom', 'above', "i'd", "let's", 'their', 'him', 'after',
              'was', 'before', 'for', 'did', 'few', "we've", "she'd", 'to', 'because', 'an', 'and', 'he', 'same', 'theirs',
              'yourself', 'too', "don't", 'could', "wouldn't", "mustn't", 'so', 'such', 'its', 'here', 'are', 'off', 'out',
              "didn't", 'have', 'his', 'or', "isn't", 'that', 'of', 'our', 'we', 'has', 'if', 'between', 'most', 'some',
              "they're", "weren't", 'about', 'any', "haven't", "he'd", 'been', 'product'])

  for (let i = 0; i < tags.length; i++) {
	let splitTags = tags[i].split("_");
	let tagSpace = splitTags.length > 1 ? splitTags[1] : splitTags[0];
	//[skin , care]
	let tagsSplitBySpace = tagSpace.split(" ").map(s => stemmer(s).toLowerCase());

	for(let tagSplit of tagsSplitBySpace)
	{
		if(!keywordToTagSplitBySpace[tagSplit])
		{
			keywordToTagSplitBySpace[tagSplit] = [];
		}
		keywordToTagSplitBySpace[tagSplit].push(tagsSplitBySpace)

	}
	// map 1 {skin: [[skin, care]] , care: [[skin,care]]}
	
	if(!stemToReal[JSON.stringify(tagsSplitBySpace)])
	{
		stemToReal[JSON.stringify(tagsSplitBySpace)] = [];
	}
	stemToReal[JSON.stringify(tagsSplitBySpace)].push(tags[i]);
	//map 2 [skin, care] : Type_Skin Care
    // finalTagList[stemmer(splitTags.length > 1 ? splitTags[1] : tags[i]).toLowerCase()] = 0;
    // stemToReal[stemmer(splitTags.length > 1 ? splitTags[1] : tags[i]).toLowerCase()] = tags[i];
  }
  console.log("keywords" );
  console.log(keywordToTagSplitBySpace)
  console.log("stem to real")
  console.log(stemToReal)

  let tagFrequency = {};
  for (let i = 0; i < stemmedSource.length; i++) {
    let lowerTag = stemmedSource[i].toLowerCase()
    if (keywordToTagSplitBySpace[lowerTag] != undefined) {
		if(!tagFrequency[lowerTag])
		{
			tagFrequency[lowerTag]  = 0;
		}
		if(!STOP_WORDS.has(lowerTag))
		{
			tagFrequency[lowerTag] += 1;

		}
      
    }
  }
  console.log("tag freq")
  let tagsToSend = [];
  let sortedTagFreq = Object.keys(tagFrequency).map(function(key) {
    return [keywordToTagSplitBySpace[key],tagFrequency[key]];
  });
  sortedTagFreq.sort(function(first, second) {
    return second[1] - first[1];
  });
  console.log("tags freqas");
  console.log(sortedTagFreq)
  let allTagsScores = 0;
  let currentTagMax  = 0;
  let currentTagMaxIndex = 0;
  let tagsToCompare = sortedTagFreq[0][0]

  if(tagsToCompare.length == 1)
  {
	  tagsToSend = stemToReal[JSON.stringify(tagsToCompare[0])]
	  
  }else
  {
	for(let i = 0; i < tagsToCompare.length;i++)
	{
		allTagsScores = 0;
		console.log(tagFrequency)
		for( let k = 0 ; k < tagsToCompare[i].length; k++)
		{
			allTagsScores += tagFrequency[tagsToCompare[i][k]] ? tagFrequency[tagsToCompare[i][k]] : 0;
			console.log( "BITCH "+ JSON.stringify(allTagsScores) + " "  + JSON.stringify(sortedTagFreq[0][0][i][k]))

		}
		if(allTagsScores > currentTagMax)
		{
			currentTagMax = allTagsScores;
			currentTagMaxIndex = i;
		}
		console.log( "HOE "+ allTagsScores + " "  + JSON.stringify(sortedTagFreq[0][0][i]))
	}
	tagsToSend = stemToReal[JSON.stringify(tagsToCompare[currentTagMaxIndex])]
	  
  }
  console.log("tags");
  console.log(tagsToSend)


  // Tag freq {skin: 12, care: 30}
//   console.log(finalTagList);

  
//   let tagsToSend = [];
//   let firstFive = items.slice(0, 1);
//   for (let i = 0; i < firstFive.length; i++) {
//     tagsToSend.push(firstFive[i][0]);
//   }
  console.log()

  // Set up our HTTP request
  var xhr = new XMLHttpRequest();

  // Setup our listener to process completed requests
  xhr.onload = function () {

      // Process our return data
      if (xhr.status >= 200 && xhr.status < 300) {
          // What do when the request is successful
          let productList = JSON.parse(xhr.responseText);
          let finalList = [];
          for (let i = 0; i < productList.length; i++) {
            finalList.push(productList[i])
		  }
		  console.log(finalList)
          callback(finalList)
      } else {
          console.log("eoh")
      }

  };
  // Create and send a GET request
  // The first argument is the post type (GET, POST, PUT, DELETE, etc.)
  // The second argument is the endpoint URL
  xhr.open('POST', 'https://ethic-scoring-server.herokuapp.com/api/shopifyProduct/allProducts');
  xhr.setRequestHeader("Content-type", "application/json");
  xhr.send(JSON.stringify({tags: tagsToSend}));
} 

chrome.runtime.onMessage.addListener(function(request, sender) {
  console.log(request.source);
  console.log(request.stemmedSource);
  getTags(data => stemTags(data["tags"], request.stemmedSource, data => getProductFigScores(data, data => getBars(data))))
  
  if (request.action == "getSource") {
    // message.innerText = request.source;
  }
});

function onWindowLoad() {

	var message = document.querySelector('#message');
	var vendor = document.querySelector('#vendor');
	var productScore = document.querySelector('#productScore');
	var productDescription = document.querySelector('#productDescription');
	var productPrice = document.querySelector('#productPrice');
	var myBtn = document.querySelector('#myBtn');
	var picture = document.querySelector('#picture');
  
	chrome.tabs.executeScript(null, {
	  file: "getPagesSourceBundle.js"
	}, function() {
	  // If you try and inject into an extensions page or the webstore/NTP you'll get an error
	  if (chrome.runtime.lastError) {
		message.innerText = 'There was an error injecting script : \n' + chrome.runtime.lastError.message;
	  }
	});
  
  }
  
  window.onload = onWindowLoad;
},{"stemmer":1}]},{},[2]);
