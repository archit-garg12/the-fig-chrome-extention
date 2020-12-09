

const cheerio = require("cheerio")
const stemmer = require("stemmer")

let vendor = "";
let productPrice = "";
let title = "";
let url = "";
let picture = "";

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

function getTags(callback) {
    var xhr = new XMLHttpRequest();

    xhr.onload = function () {

        if (xhr.status >= 200 && xhr.status < 300) {
            callback(JSON.parse(xhr.responseText));
        } else {
          
            console.log('The request failed!');
        }

    };
    xhr.open('GET', 'https://ethic-scoring-server.herokuapp.com/api/shopifyProduct/allTags');
    xhr.send();
}

function getBars(productId, callback){

	var barStyle = new XMLHttpRequest();

	barStyle.onload = function(){

		if (barStyle.status >= 200 && barStyle.status < 300){

			let styles = JSON.parse(barStyle.responseText);
			console.log(styles);
            let tempBarList = {}
			for (const catKey of Object.keys(styles.scores.normalizedScore)) {
				const doesNotApply = '<p style="font-size: 14px;font-weight:500;">This Category Does Not Apply To This Product</p>'
				if (styles.scores.possibleScore[catKey] == 0) {
                    tempBarList[catKey] = 0;
				} else {
                   
					
					let numString = Math.floor(styles.scores.defaultScore[catKey] / styles.scores.possibleScore[catKey] * 100).toString() + "%";
                    tempBarList[catKey] = numString;
				}


            }
            let numString = Math.floor(styles["scores"]["ethicScore"] / 100 * 100).toString() + "%";
            tempBarList["avg"] = numString

            callback(tempBarList);

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
		  	let items = Object.keys(figScores["scores"]).map(function(key) {
    			return [key, figScores["scores"][key]["scores"]["ethicScore"]];
  			});
			// Sort the array based on the second element
			items.sort(function(first, second) {
				return second[1] - first[1];
			});	
			
			
			var product;
			for (var i = 0; i < products.length; i++){
				if (products[i]["id"] == parseInt(items[0][0])){
					product = products[i];
					break;
				}
			}

			if (items.length > 0){
				title = product["title"];
				url = "https://thefutureisgood.co/products/" + product["handle"];
				console.log(url);
				vendor = "Sold By: " + product["vendor"];
                productPrice = "Price: $" + product["variants"][0]["price"];
                let imgURL = product["image"]["src"];
                picture = `<img src="${imgURL}">`;
				callback(product["id"].toString());
				
			      
			}
			else{
				title = "";
				vendor = "";
			}
			// console.log(products[parseInt(items[0][0])]);
			console.log(product);

		} else {
			console.log("test")
		}
  
	};

	xhr.open('POST', 'https://ethic-scoring-server.herokuapp.com/api/shopifyProduct/score');
	xhr.setRequestHeader("Content-type", "application/json");
    xhr.send(JSON.stringify({idList: productIds }));
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
  console.log(sortedTagFreq);
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
			console.log( "n "+ JSON.stringify(allTagsScores) + " "  + JSON.stringify(sortedTagFreq[0][0][i][k]))

		}
		if(allTagsScores > currentTagMax)
		{
			currentTagMax = allTagsScores;
			currentTagMaxIndex = i;
		}
		console.log( "s "+ allTagsScores + " "  + JSON.stringify(sortedTagFreq[0][0][i]))
	}
	tagsToSend = stemToReal[JSON.stringify(tagsToCompare[currentTagMaxIndex])]
	  
  }
  console.log("tags");
  console.log(tagsToSend)


  console.log()
  var xhr = new XMLHttpRequest();

  xhr.onload = function () {

      if (xhr.status >= 200 && xhr.status < 300) {
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
  xhr.open('POST', 'https://ethic-scoring-server.herokuapp.com/api/shopifyProduct/allProducts');
  xhr.setRequestHeader("Content-type", "application/json");
  xhr.send(JSON.stringify({tags: tagsToSend}));
} 

function setBarListEmpty(callback)
{
    callback({})
}
chrome.storage.sync.set({"product":{
    vendor: "",
    productPrice: "",
    title: "",
    url: "",
    barList: "",
    picture:""

}},getTags(tags => 
        {
            stemTags(tags["tags"], stemming(DOMtoString(document)), products => {
                getProductFigScores(products, pid => {
                    getBars(pid, barLists => chrome.storage.sync.set({"product":{
                        vendor: vendor,
                        productPrice: productPrice,
                        title: title,
                        url: url,
                        barList: barLists,
                        picture:picture

                    }}, function() {
                        console.log('Value is set to');
                      }))
                })
            })
        }))