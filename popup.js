// Copyright 2018 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

'use strict';

var stemmer = (function(){
	var step2list = {
			"ational" : "ate",
			"tional" : "tion",
			"enci" : "ence",
			"anci" : "ance",
			"izer" : "ize",
			"bli" : "ble",
			"alli" : "al",
			"entli" : "ent",
			"eli" : "e",
			"ousli" : "ous",
			"ization" : "ize",
			"ation" : "ate",
			"ator" : "ate",
			"alism" : "al",
			"iveness" : "ive",
			"fulness" : "ful",
			"ousness" : "ous",
			"aliti" : "al",
			"iviti" : "ive",
			"biliti" : "ble",
			"logi" : "log"
		},

		step3list = {
			"icate" : "ic",
			"ative" : "",
			"alize" : "al",
			"iciti" : "ic",
			"ical" : "ic",
			"ful" : "",
			"ness" : ""
		},

		c = "[^aeiou]",          // consonant
		v = "[aeiouy]",          // vowel
		C = c + "[^aeiouy]*",    // consonant sequence
		V = v + "[aeiou]*",      // vowel sequence

		mgr0 = "^(" + C + ")?" + V + C,               // [C]VC... is m>0
		meq1 = "^(" + C + ")?" + V + C + "(" + V + ")?$",  // [C]VC[V] is m=1
		mgr1 = "^(" + C + ")?" + V + C + V + C,       // [C]VCVC... is m>1
		s_v = "^(" + C + ")?" + v;                   // vowel in stem

	return function (w) {
		var 	stem,
			suffix,
			firstch,
			re,
			re2,
			re3,
			re4,
			origword = w;

		if (w.length < 3) { return w; }

		firstch = w.substr(0,1);
		if (firstch == "y") {
			w = firstch.toUpperCase() + w.substr(1);
		}

		// Step 1a
		re = /^(.+?)(ss|i)es$/;
		re2 = /^(.+?)([^s])s$/;

		if (re.test(w)) { w = w.replace(re,"$1$2"); }
		else if (re2.test(w)) {	w = w.replace(re2,"$1$2"); }

		// Step 1b
		re = /^(.+?)eed$/;
		re2 = /^(.+?)(ed|ing)$/;
		if (re.test(w)) {
			var fp = re.exec(w);
			re = new RegExp(mgr0);
			if (re.test(fp[1])) {
				re = /.$/;
				w = w.replace(re,"");
			}
		} else if (re2.test(w)) {
			var fp = re2.exec(w);
			stem = fp[1];
			re2 = new RegExp(s_v);
			if (re2.test(stem)) {
				w = stem;
				re2 = /(at|bl|iz)$/;
				re3 = new RegExp("([^aeiouylsz])\\1$");
				re4 = new RegExp("^" + C + v + "[^aeiouwxy]$");
				if (re2.test(w)) {	w = w + "e"; }
				else if (re3.test(w)) { re = /.$/; w = w.replace(re,""); }
				else if (re4.test(w)) { w = w + "e"; }
			}
		}

		// Step 1c
		re = /^(.+?)y$/;
		if (re.test(w)) {
			var fp = re.exec(w);
			stem = fp[1];
			re = new RegExp(s_v);
			if (re.test(stem)) { w = stem + "i"; }
		}

		// Step 2
		re = /^(.+?)(ational|tional|enci|anci|izer|bli|alli|entli|eli|ousli|ization|ation|ator|alism|iveness|fulness|ousness|aliti|iviti|biliti|logi)$/;
		if (re.test(w)) {
			var fp = re.exec(w);
			stem = fp[1];
			suffix = fp[2];
			re = new RegExp(mgr0);
			if (re.test(stem)) {
				w = stem + step2list[suffix];
			}
		}

		// Step 3
		re = /^(.+?)(icate|ative|alize|iciti|ical|ful|ness)$/;
		if (re.test(w)) {
			var fp = re.exec(w);
			stem = fp[1];
			suffix = fp[2];
			re = new RegExp(mgr0);
			if (re.test(stem)) {
				w = stem + step3list[suffix];
			}
		}

		// Step 4
		re = /^(.+?)(al|ance|ence|er|ic|able|ible|ant|ement|ment|ent|ou|ism|ate|iti|ous|ive|ize)$/;
		re2 = /^(.+?)(s|t)(ion)$/;
		if (re.test(w)) {
			var fp = re.exec(w);
			stem = fp[1];
			re = new RegExp(mgr1);
			if (re.test(stem)) {
				w = stem;
			}
		} else if (re2.test(w)) {
			var fp = re2.exec(w);
			stem = fp[1] + fp[2];
			re2 = new RegExp(mgr1);
			if (re2.test(stem)) {
				w = stem;
			}
		}

		// Step 5
		re = /^(.+?)e$/;
		if (re.test(w)) {
			var fp = re.exec(w);
			stem = fp[1];
			re = new RegExp(mgr1);
			re2 = new RegExp(meq1);
			re3 = new RegExp("^" + C + v + "[^aeiouwxy]$");
			if (re.test(stem) || (re2.test(stem) && !(re3.test(stem)))) {
				w = stem;
			}
		}

		re = /ll$/;
		re2 = new RegExp(mgr1);
		if (re.test(w) && re2.test(w)) {
			re = /.$/;
			w = w.replace(re,"");
		}

		// and turn initial Y back to y

		if (firstch == "y") {
			w = firstch.toLowerCase() + w.substr(1);
		}

		return w;
	}
})();

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

function getProductFigScores(products)
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
				vendor.innerText = "Sold By: " + product["vendor"];
				productScore.innerText = "Fig Score: " + items[0][1].toFixed(2);
				productPrice.innerText = "Price: $" + product["variants"][0]["price"];
			}
			else{
				message.innerText = "";
				vendor.innerText = "";
			}
			// console.log(products[parseInt(items[0][0])]);
			console.log(product);

		} else {
			console.log("hoe")
		}
  
	};
	// Create and send a GET request
	// The first argument is the post type (GET, POST, PUT, DELETE, etc.)
	// The second argument is the endpoint URL
	xhr.open('POST', 'https://ethic-scoring-server.herokuapp.com/api/shopifyProduct/score');
	xhr.setRequestHeader("Content-type", "application/json");
	xhr.send(JSON.stringify({idList: productIds }));
}

function button(){
	console.log("tasdfasdf");
}


function stemTags(tags, stemmedSource, callback) {
  let finalTagList = {};
  let stemToReal = {};

  for (let i = 0; i < tags.length; i++) {
	let splitTags = tags[i].split("_");
    finalTagList[stemmer(splitTags.length > 1 ? splitTags[1] : tags[i]).toLowerCase()] = 0;
    stemToReal[stemmer(splitTags.length > 1 ? splitTags[1] : tags[i]).toLowerCase()] = tags[i];
  }
  for (let i = 0; i < stemmedSource.length; i++) {
    let lowerTag = stemmedSource[i].toLowerCase()
    if (finalTagList[lowerTag] != undefined) {
      finalTagList[lowerTag] += 1;
    }
  }
  console.log(finalTagList);

  let items = Object.keys(finalTagList).map(function(key) {
    return [stemToReal[key], finalTagList[key]];
  });
  // Sort the array based on the second element
  items.sort(function(first, second) {
    return second[1] - first[1];
  });

  console.log(items);
  let tagsToSend = [];
  let firstFive = items.slice(0, 1);
  for (let i = 0; i < firstFive.length; i++) {
    tagsToSend.push(firstFive[i][0]);
  }
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
          console.log("hoe")
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
  console.log(request.action);
  console.log(request.stemmedSource);
  console.log(request.tagList);
  console.log(request.source);
  getTags(data => stemTags(data["tags"], request.stemmedSource, data => getProductFigScores(data)))
  
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

  chrome.tabs.executeScript(null, {
    file: "getPagesSource.js"
  }, function() {
    // If you try and inject into an extensions page or the webstore/NTP you'll get an error
    if (chrome.runtime.lastError) {
      message.innerText = 'There was an error injecting script : \n' + chrome.runtime.lastError.message;
    }
  });

}

window.onload = onWindowLoad;