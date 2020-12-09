// @author Rob W <http://stackoverflow.com/users/938089/rob-w>
// Demo: var serialized_html = DOMtoString(document);

// import stemmer from './stemmer.js';

const cheerio = require("cheerio")
const stemmer = require("stemmer")


function DOMtoString(document_root) {
	const $ = cheerio.load(document.documentElement.innerHTML)
	let html = $("#dp").text();
    return html;
}

function stemming(html) {
    const re = /\W+/
    let x = html.split(re)
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