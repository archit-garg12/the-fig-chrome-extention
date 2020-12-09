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