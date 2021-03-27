function insertIndex(key, wordIndex) {
	if(!(key in index)) {
		index[key] = [];
	}
	index[key].push(wordIndex);
}

function hashWord(word) {
	var hash = BigInt(0);
	for(var i = 0; i < word.length; i++) {
		hash += BigInt(word.charCodeAt(i));
	}
	return hash.toString();
}

function createIndex(callback) {
	var script = document.createElement('script');
	script.onload = function() {
		words = DE.split(/\s+/);
		index = {};
		for(var i = 0; i < words.length; i++) {
			insertIndex(hashWord(words[i]), i);
		}
		if(callback) {
			callback();
		}
	}
	script.setAttribute('charset', 'UTF-8');
	script.src = 'https://Netzdenunziant.github.io/unpaywall/de.js';
	document.body.appendChild(script);
}

function shallowEqual(object1, object2) {
	var keys1 = Object.keys(object1);
	var keys2 = Object.keys(object2);

	if (keys1.length !== keys2.length) {
		return false;
	}

	for (var key of keys1) {
		if (object1[key] !== object2[key]) {
			return false;
		}
	}

	return true;
}

function createWordMap(word) {
	var map = {};
	for(var i = 0; i < word.length; i++) {
		if(!(word[i] in map)) {
			map[word[i]] = 0;
		}
		map[word[i]]++;
	}
	return map;
}

function idsToWords(ids) {
	return ids.map(function(id) {return words[id];});
}

function unscramble(word) {
	var hash = hashWord(word);
	if(!(hash in index)) {
		return [];
	}
	var potentialWords = idsToWords(index[hash]);
	var wordMap = createWordMap(word);
	var result = potentialWords.filter(function(x){return shallowEqual(wordMap, createWordMap(x));});
	return result;
}

function capitalizeFirstLetter(word) {
	return word.slice(0, 1).toUpperCase() + word.slice(1);
}

function unscrambledToText(unscrambled, capitalize=false) {
	if(capitalize) {
		unscrambled = unscrambled.map(capitalizeFirstLetter);
	}
	if(unscrambled.length == 1) {
		return unscrambled[0];
	} else if (unscrambled.length > 1) {
		return '{' + unscrambled.join(', ') + '}';
	}
	return null;
}

function unscrambleText(text) {
	var tokens = text.split(/\s+/);
	var result = '';
	var pre = '„»';
	var post = ':.?“,!«';

	for(var token of tokens) {
		var append = '';

		for(var c of pre) {
			if(token.indexOf(c) >= 0) {
				result += c;
			}
		}
		
		for(var c of post) {
			if(token.indexOf(c) >= 0) {
				append += c;
			}
		}
		
		for(var c of (pre + post)) {
			token = token.replace(c, '');
		}

		var unscrambled = unscramble(token);
		if(unscrambled.length >= 1) {
			result += unscrambledToText(unscrambled);
		} else {
			var unscrambledLower = unscramble(token.toLowerCase());
			if(unscrambledLower.length > 0) {
				result += unscrambledToText(unscrambledLower, true);
			} else {
				result += token;
			}
		}
		result += append + ' ';
	}
	return result;
}

function tryJsonMethod() {
        var innerHTML = document.body.innerHTML;
        var offset = innerHTML.indexOf('"articleBody":');
        if(offset < 0) {
                return false;
        }
        var nextOffset = offset + 1;
        while(nextOffset >= 0) {
                var nextOffset = innerHTML.indexOf('"', nextOffset);
                nextOffset += 1;
                console.log(nextOffset);
                try {
                        var object = JSON.parse('{' + innerHTML.slice(offset, nextOffset) + '}')
                        return object.articleBody;
                } catch {
                }
        }
        return false;
}

function fickRND() {
	var article = document.querySelector('.pdb-article-body-paidcontentintro');
	if(!article) {
		return false;
	}
	article.classList = [];
	var erasmo = document.querySelector('#erasmo');
	if(!erasmo) {
		return false;
	}
	erasmo.parentElement.removeChild(erasmo);
	var text = tryJsonMethod();
	if(!text) {
		return false;
	}
	article.querySelector('.pdb-richtext-field p').textContent = text;
	return true;
}

function fickRP() {
	var parkArticle = document.querySelector('.park-article--reduced');
	if(!parkArticle) {
		return false;
	}
	parkArticle.classList.remove('park-article--reduced');
	var paywall = document.querySelector('.park-widget--paywall-article');
	if(paywall && paywall.parentElement) {
		paywall.parentElement.removeChild(paywall);
	}
	createIndex(function(){
		var blurred = document.querySelectorAll('.park-article-content .text-blurred');
		blurred.forEach(function(element){
			element.classList.remove('text-blurred');
			element.textContent = unscrambleText(element.textContent);
		});
	});
	return true;
}

function scheissPresselumpen() {
	var success = fickRND() || fickRP();
	if(!success) {
		alert('Diese Seite wird nicht unterstützt.');
	}
}

scheissPresselumpen();
