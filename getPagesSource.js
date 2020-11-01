// @author Rob W <http://stackoverflow.com/users/938089/rob-w>
// Demo: var serialized_html = DOMtoString(document);

import stemmer from './stemmer.js';

function DOMtoString(document_root) {
    var btn = document.createElement("BUTTON")
    var t = document.createTextNode("CLICK ME");
    btn.appendChild(t);
    //Appending to DOM 
    document.body.appendChild(btn);
    let html = document_root.documentElement.outerHTML
    // html.split(' ')
    let f = stemmer()
    console.log(f("swimming"));
    return html;
}



chrome.runtime.sendMessage({
    action: "getSource",
    source: DOMtoString(document)
});