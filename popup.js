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
  chrome.tabs.query({active: true, currentWindow: true}, tabs => {
    let url = tabs[0].url;
    console.log(url);
    console.log("hello");
    console.log("test branch");
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