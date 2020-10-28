// Copyright 2018 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

'use strict';

let changeColor = document.getElementById('changeColor');

chrome.storage.sync.get('color', function(data) {
  changeColor.style.backgroundColor = data.color;
  changeColor.setAttribute('value', data.color);
});

changeColor.onclick = function(element) {
  chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
    let url = tabs[0].url;
    console.log(url);

    fetch(url).then(function(html)
    {
        html.text().then(function(text) 
        {
            console.log(text);
            let re = new RegExp('<link rel="canonical".*', 'g');
            let link   = text.match(re)[0];
            link = link.split(" ")[2].split("/")[3];
            console.log(link);
        });
      
        
        
    });
    
   
    // use url here inside the callback because it's asynchronous!
  });
  // let color = element.target.value;
  // chrome.tabs.query({active: true, currentWindow: true, lastFocusedWindow: true}, function(tabs) {
  //   chrome.tabs.executeScript(
  //       tabs[0].id,
  //       {code: 'document.body.style.backgroundColor = "' + color + '";'}, function() {
  //       });
  // });
};

async function test(){
    const response = await fetch(url);
    const text = await response.text();
 
};