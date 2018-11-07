# xMatters Event Translator

This project includes a shared library to translate any xMatters event to other languages automatically and uses a person's set language in xMatters. The shared library can be applied to any event that is processed through the xMatters Integration Builder. Two methods are used for translations; Google Translator API and a custom library.

Uses:
Have an existing integration that sends events to xMatters in English and want to support your end users that speak Spanish, French, Mandarin, Icelandic or other language? Process the even through this shared library. It's simple to setup and simple to implement.

Have events that are to xMatters with abbreviations or full words you want to translate to abberviations? What about other specific translations you need to make? Use the 'pirate' function and dictionary as an example of creating your own library.

# Pre-Requisites

- xMatters
- xMatters account - If you don't have one, [get one](https://www.xmatters.com)!
- xMatters Communication Plan with events initiated using the Integration Builder

# Files

- [TranslatorExample.zip](TranslatorExample.zip) - This is an example comm plan to help get started. It includes the shared library, and example form with multiple languages configured, the original properties and the properties for each language to be translated.
- [EmailMessageTemplate.html](EmailMessageTemplate.html) - This is an example HTML template for emails and push messages.
- [translate.js](translate.js) - This is the Shared Library contining the functions needed to translate properties in an existing comm plan or integration. Note the comments

# How it works

Events created in xMatters programatically are sent to xMatters through a REST API call to the xMatters inbound integration within an xMatters communication plan. This project contains a shared library that can be applied to any event in the by making external calls to the Google Translate API or a custom library to append the existing properties in an event with properties in one or more languages.

# Installation

The installation of this project requires modification of an existing regardless of the integrated system or solution as long as the events to be translated are processes through the xMatters Integration Builder Inbound Service.

## xMatters set up

1. Enable French and Spanish in your xMatters instance. If you are unable to do this contact xMatters Client Assistance for help.
2. Login to xMatters --> Developer --> Communcation Plans --> Select your existing plan --> Edit --> Integration Builder --> Inbound Integrations
3. Inbound services can have several types. If you have a "Transform content to create a new xMatters Event." type inbound service. Add this code just before posting the event (`form.post(payload);`). Assumes the event payload is in a variable called 'payload':
   ```
    var translate = require('translate'); //get shared library
    var languages = ["fr", "es"]; // https://cloud.google.com/translate/docs/languages
    payload = translate.google(payload, languages);
   ```
   If you create a inbound service of type "Transform content to create a new xMatters Event." this is the complete code you will need.

```
    //pull in shared library (make sure the shared library is named translate)
    var translate = require('translate');

    var payload = JSON.parse(request.body);  //Use this if the payload is a JSON object in the request body
    var languages = ["fr", "es"];

    //calling both functions will result in extraneous translated properties.
    payload = translate.google(payload, languages);

    form.post(payload);
```

3. Create a new shared library called "translate" and copy the code from translate.js to that shared library and save.
4. Get a Google Translate API key https://cloud.google.com/translate/. Your endpoint url with the ky should look something like: https://translation.googleapis.com/language/translate/v2?key=YOUR_KEY_HERE
5. Add a end point called "Google Translate" and paste the base url you acquired in the step above.
6. The shared library added will add new properties to the posted event for each of the languages configured in the transform script that was modified above ("fr", "es"). For example, if you already had a property called "status", a property will be set for the event called "status-fr" with the French translation of the status value received. Create all the matching properties for all languages you intend to use in the comm plan and add them to the form the message exist on.
7. Enable each of the matching languages in xMatters and configure Messaging templates for each language using the translated properties. Following the previous example, after French has been enabled, copy the Email Comm Plan Message template from the default language and replace the status property with the newly created status-fr property and save the message template.

# Testing

# Troubleshooting
