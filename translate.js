/*
 * translate
 *
 *  This shared library for translating any event's properties to other languages.
 *  The google function uses the google translation api to translate from 
 *  the source language to other languages. 
 *  The pirate function may be used as a example of creating your own translation
 *  library if you have custom translations that are needed. Simply update the dictionary.
 * 
 *  Exposed methods:
 *    google(payload, languages) - translates the properties provided in a standard event payload (https://help.xmatters.com/xmapi/index.html#trigger-an-event)
 *             to multiple languages. 
 *       payload - object - xMatters event payload with a 'properties' property to be updated with translated properties.
 *              property names are the original appended with -language id
 *       languages - array - array of language identifiers as strings as defined by google: https://cloud.google.com/translate/docs/languages 
 * 
 *       NOTE: Requires defined "Google Translation" endpoint. Example:
 *          Name: Google Translate
 *          Base URL: https://translation.googleapis.com/language/translate/v2?key=YOUR_KEY_HERE
 *          Auth Type: None
 *
 *    pirate(payload) - Utilizes a custom library to translate all properties into 'pirate'
 *       parameter1 - string - The name of stuff to get
 *
 *  Usage:
    Example Inbound Service Transform Script -->

    //pull in shared library (make sure the shared library is named translate)
    var translate = require('translate');

    var payload = JSON.parse(request.body);  //Use this if the payload is a JSON object in the request body
    var languages = ["en", "fr", "zh-cn", "is", "es"];

    //calling both functions will result in extraneous translated properties. 
    payload = translate.google(payload, languages);
    //payload = translate.pirate(payload);

    form.post(payload);

 */

/*
 * This function will take a normal xMatters event payload and converts it to multiple languages.
 * Languages supported: https://cloud.google.com/translate/docs/languages 
 * languages should be an array of google language codes: ["en", "es", "is"]
 * 
 * Requires "Google Translation" endpoint as defined here https://cloud.google.com/translate/docs/translating-text#translate_translate_text-protocol 
*/
exports.google = function(payload, languages) {
  if (languages === undefined || languages.length === 0) {
    // languages not set, returning receieved payload.
    return payload;
  }

  //extract properties from payload in source language
  var properties = payload.properties;

  //for each language
  for (i = 0; i < languages.length; i++) {
    var language = languages[i];

    //Build language translation request body
    var requestPayload = {
      target: language,
      q: []
    };

    //add properties to translate
    for (var property in properties) {
      if (properties.hasOwnProperty(property)) {
        var element = properties[property];
        requestPayload.q.push(element);
      }
    }

    //build and make translation request to google
    var getGoogleTranslationRequest = http.request({
      endpoint: 'Google Translation',
      method: 'POST'
    });
    var googleResponse = getGoogleTranslationRequest.write(requestPayload);

    //write translated properties back to payload.properties, use order to identify property
    var translations = JSON.parse(googleResponse.body).data.translations;
    var translationCounter = 0;
    for (var _property in properties) {
      if (properties.hasOwnProperty(_property)) {
        if (googleResponse.statusCode != 200) {
          payload.properties[_property + '-' + language] = properties[_property];
        } else {
          payload.properties[_property + '-' + language] =
            translations[translationCounter].translatedText;
        }
        translationCounter += 1;
      }
    }
  }

  return payload;
};

/*
 * returns event payload with new properties translated to pirate. 
 * new properties are name the same as name amended with -pr
 * 
*/
exports.pirate = function(payload) {
  //extract properties from payload
  var properties = payload.properties;

  //translate properties
  for (var property in properties) {
    if (properties.hasOwnProperty(property)) {
      var element = properties[property];
      payload.properties[property + '-pr'] = translate(element);
    }
  }

  return payload;

  //pirate translation code sourced from: https://github.com/mikewesthad/pirate-speak/blob/master/lib/pirate-speak.js
  //modified by xMatters 2018-Oct-23
  //license: MIT

  function translateWord(word) {
    var dictionary = {
      address: "port o' call",
      admin: 'helm',
      am: 'be',
      an: 'a',
      and: "n'",
      are: 'be',
      award: 'prize',
      bathroom: 'head',
      beer: 'grog',
      before: 'afore',
      belief: 'creed',
      between: 'betwixt',
      big: 'vast',
      bill: 'coin',
      bills: 'coins',
      boss: 'admiral',
      bourbon: 'rum',
      box: 'barrel',
      boy: 'lad',
      buddy: 'mate',
      business: 'company',
      businesses: 'companies',
      calling: "callin'",
      canada: 'Great North',
      cash: 'coin',
      cat: 'parrot',
      cheat: 'hornswaggle',
      comes: 'hails',
      comments: 'yer words',
      cool: 'shipshape',
      country: 'land',
      dashboard: 'shanty',
      dead: "in Davy Jones's Locker",
      disconnect: 'keelhaul',
      do: "d'",
      dog: 'parrot',
      dollar: 'doubloon',
      dollars: 'doubloons',
      dude: 'pirate',
      employee: 'crew',
      everyone: 'all hands',
      eye: 'eye-patch',
      family: 'kin',
      fee: 'debt',
      female: 'wench',
      females: 'wenches',
      food: 'grub',
      for: 'fer',
      friend: 'shipmate',
      friends: 'crew',
      gin: 'rum',
      girl: 'lass',
      girls: 'lassies',
      go: 'sail',
      good: 'jolly good',
      grave: "Davy Jones's Locker",
      group: 'maties',
      gun: 'bluderbuss',
      haha: 'yo ho',
      hahaha: 'yo ho ho',
      hahahaha: 'yo ho ho ho',
      hand: 'hook',
      happy: 'grog-filled',
      hello: 'ahoy',
      hey: 'ahoy',
      hi: 'ahoy',
      hotel: 'fleebag inn',
      i: 'me',
      "i'm": 'i be',
      internet: "series o' tubes",
      invalid: 'sunk',
      is: 'be',
      island: 'isle',
      "isn't": 'be not',
      "it's": "'tis",
      jail: 'brig',
      kill: 'keelhaul',
      king: 'king',
      ladies: 'lasses',
      lady: 'lass',
      lawyer: 'scurvy land lubber',
      left: 'port',
      leg: 'peg',
      logout: 'walk the plank',
      lol: 'blimey',
      male: 'pirate',
      man: 'pirate',
      manager: 'admiral',
      money: 'doubloons',
      month: 'moon',
      my: 'me',
      never: 'nary',
      no: 'nay',
      not: 'nay',
      of: "o'",
      old: 'barnacle-covered',
      omg: 'shiver me timbers',
      over: "o'er",
      page: 'parchment',
      people: 'scallywags',
      person: 'scurvy dog',
      posted: 'tacked to the yardarm',
      president: 'king',
      prison: 'brig',
      quickly: 'smartly',
      really: 'verily',
      relative: 'kin',
      relatives: 'kin',
      religion: 'creed',
      restaurant: 'galley',
      right: 'starboard',
      rotf: "rollin' on the decks",
      say: 'cry',
      seconds: "ticks o' tha clock",
      shipping: 'cargo',
      small: 'puny',
      snack: 'grub',
      soldier: 'sailor',
      sorry: 'yarr',
      spouse: "ball 'n' chain",
      state: 'land',
      supervisor: "Cap'n",
      "that's": 'that be',
      the: 'thar',
      theif: 'swoggler',
      them: "'em",
      this: 'dis',
      to: "t'",
      together: "t'gether",
      treasure: 'booty',
      vodka: 'rum',
      was: 'be',
      water: 'grog',
      we: 'our jolly crew',
      "we're": "we's",
      whiskey: 'rum',
      whisky: 'rum',
      wine: 'grog',
      with: "wit'",
      woman: 'comely wench',
      women: 'beauties',
      work: 'duty',
      yah: 'aye',
      yeah: 'aye',
      yes: 'aye',
      you: 'ye',
      "you're": 'you be',
      "you've": 'ye',
      your: 'yer',
      yup: 'aye'
    };

    var pirateWord = dictionary[word.toLowerCase()];
    if (pirateWord === undefined) return word;
    else return applyCase(word, pirateWord);
  }

  // Take the case from wordA and apply it to wordB
  function applyCase(wordA, wordB) {
    // Exception to avoid words like "I" being converted to "ME"
    if (wordA.length === 1 && wordB.length !== 1) return wordB;
    // Uppercase
    if (wordA === wordA.toUpperCase()) return wordB.toUpperCase();
    // Lowercase
    if (wordA === wordA.toLowerCase()) return wordB.toLowerCase();
    // Capitialized
    var firstChar = wordA.slice(0, 1);
    var otherChars = wordA.slice(1);
    if (firstChar === firstChar.toUpperCase() && otherChars === otherChars.toLowerCase()) {
      return wordB.slice(0, 1).toUpperCase() + wordB.slice(1).toLowerCase();
    }
    // Other cases
    return wordB;
  }

  function isLetter(character) {
    if (character.search(/[a-zA-Z'-]/) === -1) return false;
    return true;
  }

  function translate(text) {
    var translatedText = '';

    // Loop through the text, one character at a time.
    var word = '';
    for (var i = 0; i < text.length; i += 1) {
      var character = text[i];
      // If the char is a letter, then we are in the middle of a word, so we
      // should accumulate the letter into the word variable
      if (isLetter(character)) {
        word += character;
      }
      // If the char is not a letter, then we hit the end of a word, so we
      // should translate the current word and add it to the translation
      else {
        if (word !== '') {
          // If we've just finished a word, translate it
          var pirateWord = translateWord(word);
          translatedText += pirateWord;
          word = '';
        }
        translatedText += character; // Add the non-letter character
      }
    }

    // If we ended the loop before translating a word, then translate the final
    // word and add it to the translation.
    if (word !== '') translatedText += translateWord(word);

    return translatedText;
  }
};
