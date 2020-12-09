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

chrome.storage.onChanged.addListener(function(changes, area) {
    if ("product" in changes) {

		
        vendor.innerText = changes["product"].newValue.vendor;
		productPrice.innerText = changes["product"].newValue.productPrice;
		message.innerText = changes["product"].newValue.title;
		for (const catKey of Object.keys(changes["product"].newValue.barList)) {
			console.log(catKey)

			if (changes["product"].newValue.barList[catKey] != 0) {
				let myElement = document.getElementsByClassName(catKey + "-greenbar")[0];
				myElement.style.width = changes["product"].newValue.barList[catKey];
			}
		}
		url = changes["product"].newValue.url
		picture.innerHTML = changes["product"].newValue.picture;

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

	chrome.storage.sync.get(["product"], function(request) {
		vendor.innerText = request.product.vendor;
		productPrice.innerText = request.product.productPrice;
		message.innerText = request.product.title;
		console.log(request);
		for (const catKey of Object.keys(request.product.barList)) {

			if (request.product.barList[catKey] != 0) {
				let myElement = document.getElementsByClassName(catKey + "-greenbar")[0];
				myElement.style.width = request.product.barList[catKey];
			}
		}
		url = request.product.url
		picture.innerHTML = request.product.picture;


	  });

  }
  
  window.onload = onWindowLoad;
},{"stemmer":1}]},{},[2]);
