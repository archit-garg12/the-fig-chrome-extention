// @author Rob W <http://stackoverflow.com/users/938089/rob-w>
// Demo: var serialized_html = DOMtoString(document);

// import stemmer from './stemmer.js';

const cheerio = require("cheerio")
const stemmer = require("stemmer")


function DOMtoString(document_root) {
    // var btn = document.createElement("BUTTON")
    // var t = document.createTextNode("CLICK ME");
    // btn.appendChild(t);
    // //Appending to DOM 
    // document.body.appendChild(btn);
	const $ = cheerio.load(document.documentElement.innerHTML)
	let html = $("#dp").text();
    // return html;
    // var html = '',
    // node = document_root.firstChild;
    // while (node) {
    //     switch (node.nodeType) {
    //     case Node.ELEMENT_NODE:
    //         html += node.outerHTML;
    //         break;
    //     case Node.TEXT_NODE:
    //         html += node.nodeValue;
    //         break;
    //     case Node.CDATA_SECTION_NODE:
    //         html += '<![CDATA[' + node.nodeValue + ']]>';
    //         break;
    //     case Node.COMMENT_NODE:
    //         html += '<!--' + node.nodeValue + '-->';
    //         break;
    //     case Node.DOCUMENT_TYPE_NODE:
    //         // (X)HTML documents are identified by public identifiers
    //         html += "<!DOCTYPE " + node.name + (node.publicId ? ' PUBLIC "' + node.publicId + '"' : '') + (!node.publicId && node.systemId ? ' SYSTEM' : '') + (node.systemId ? ' "' + node.systemId + '"' : '') + '>\n';
    //         break;
    //     }
    //     node = node.nextSibling;
    // }
    return html;
}

function stemTags(tags) {
    let finalTagList = [];
    for (let i = 0; i < tags.length; i++) {
        finalTagList.push(stemmer(tags[i]));
    }
    return finalTagList;
}

function stemming(html) {
    let x = html.split(' ')
    let final = [];
    for (let i = 0; i < x.length; i++) {
        let y = stemmer(x[i]);
        if (y.localeCompare('')) {
            final.push(stemmer(x[i]));
        }
    }

    return final;
}


chrome.runtime.sendMessage({
    action: "getSource",
    source: DOMtoString(document),
    stemmedSource: stemming(DOMtoString(document)),
    // tagList: getTags(),
});