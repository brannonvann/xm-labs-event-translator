# xMatters Event Translator

This project includes a shared library to translate the properties of any xMatters event to other languages automatically and then deliver the notifications in the user's language set in the profile. The shared library can be applied to any event that is processed through the xMatters Integration Builder. This approach provides two options for translations; Google Translator API and a custom library.

**Uses:**
Do you have an existing integration that sends events to xMatters in English and want to support your end users that speak Spanish, French, Mandarin, Icelandic or another language? Process the event through this shared library and use the `google` translate function. It's simple to setup and simple to implement.

Do you have events that are sent to xMatters with obscure abbreviations or full words you want to translate to abberviations? What about other specific translations you need to make? Use the `pirate` function and dictionary as an example of creating your own library for custom "translations".

<kbd>
<a href="https://support.xmatters.com/hc/en-us/community/topics">
   <img src="https://github.com/xmatters/xMatters-Labs/raw/master/media/disclaimer.png">
</a>
</kbd>



# Pre-Requisites

- xMatters account - If you don't have one, [get one](https://www.xmatters.com)!
- Existing xMatters Workflow

# Files

- [TranslatorExample.zip](TranslatorExample.zip) - This is an example Workflow to help get started. It includes the shared library, and example form with multiple languages configured, the original properties and the properties for each language to be translated.
- [translate.js](translate.js) - This is the Shared Library contining the functions needed to translate properties in an existing Workflow or integration. Note the comments

# How it works

Events created in xMatters are sent to xMatters through a REST API call to the inbound integration within a Workflow. This repo contains a shared library that can be applied to any event in the system by making external calls to the Google Translate API or a custom library to append the existing properties in an event with properties in one or more languages.

This works by passing the entire event payload to the `translate.google` function with the list of languages to translate to. The returned object has new properties for each language. So `status` will then have `status`, `status-fr` and `status-es`. It is important to note that these properties will need to be created, added to the form layout as well as the message templates. 

# Installation

Installing this shared library is as easy as copy paste. 

## xMatters set up

1. Enable French and Spanish in your xMatters instance, see [here](https://help.xmatters.com/ondemand/installadmin/systemadministration/languages.htm) for details. If the **Languages** menu is not available, contact [xMatters Client Assistance](https://support.xmatters.com/hc/en-us/requests/new) for help.
2. In xMatters, navigate to Workflows --> Select your existing workflow --> Edit --> Integration Builder. Expand the Shared Libraries section (if needed) and click the **+ Add** button. 
3. Copy the contents of the [translate.js](translate.js) file and paste into the script section. Then change the name of the Shared Library to `translate` by clicking on the `My Shared Library` at the top. This is the name the code will reference when importing this library. 
3. In your existing "Transform content to create a new xMatters event" inbound integration, add this line to the top of the script:
    ```
    var translate = require('translate'); //get shared library
    ```
4. Then, just before the `form.post(payload);` line (which actually creates the event) add these lines (assuming the event payload is in a variable called `payload`):
    ```
     var languages = ["fr", "es"]; // https://cloud.google.com/translate/docs/languages
     payload = translate.google(payload, languages);
    ```
4. Head over to the Google cloud console: [https://cloud.google.com/translate/](https://cloud.google.com/translate/) and enable the API. Then in the **API & Services** section, select **Credentials**. Click **Create Credential** and select **API Key**. Copy the API Key value and click **Restrict Key**. Give the key a name and any necessary Application Restrictions. 
5. In the Integration Builder, click the **Endpoints** button and create a new Endpoint called `Google Translate` and and paste this value, replacing the `YOUR_KEY_HERE` with the appropriate value from above: `https://translation.googleapis.com/language/translate/v2?key=YOUR_KEY_HERE`
6. The shared library added will add new properties to the posted event for each of the languages configured in the transform script that was modified above (i.e. `fr`, `es`). For example, if you already had a property called "status", a property will be set for the event called `status-fr` with the French translation of the status value received. This means you will need to create properties **for each language**. Create all the matching properties for all languages you intend to use in the Workflow and add them to the form layout and message template.
7. Enable each of the matching languages in xMatters and configure Messaging templates for each language using the translated properties. Following the previous example, after French has been enabled, copy the Email Workflow Message template from the default language and replace the status property with the newly created status-fr property and save the message template.

# Testing

Set the language on a user to an apropriate value, such as French and another user with a different language, such as Spanish, then create an event targeting both users and inspect the resulting notifications. The resulting notifications will be in the respective languages.

# Troubleshooting

The Activity Stream for the inbound integration will be the best place to look for issues. You will see the outbound payload to Google as something like:
```
> POST https://translation.googleapis.com/language/translate/v2?key=MY_KEY_HERE HTTP/1.1
> Accept: text/plain, application/json, application/*+json, */*
> User-Agent: Xerus (EndpointClient)
> Content-Type: application/json; charset=UTF-8
> X-Trace: 36d87d53-f87c-4179-9e72-31eeb6d5d21b,752de82d-4f9a-4e9d-b1a1-93cf8bf2154f
> Content-Length: 62
{"target":"fr","q":["fancy pants oven","It is raining today"]}

< HTTP/1.1 200 OK
< Content-Type: application/json; charset=UTF-8
< Vary: Origin
< Date: Thu, 08 Nov 2018 14:22:24 GMT
< Server: ESF
< Cache-Control: private
< X-XSS-Protection: 1; mode=block
< X-Frame-Options: SAMEORIGIN
< X-Content-Type-Options: nosniff
< Alt-Svc: quic=":443"; ma=2592000; v="44,43,39,35"
< Transfer-Encoding: chunked
{
  "data": {
    "translations": [
      {
        "translatedText": "pantalon de fantaisie four",
        "detectedSourceLanguage": "en"
      },
      {
        "translatedText": "Il pleut aujourd&#39;hui",
        "detectedSourceLanguage": "en"
      }
    ]
  }
}
```

Make sure the translations are coming back from Google, if not make sure you are passing the appropriate values to the `translate.google` function. 

If that looks ok, then inspect the payload for the event. For example:
```
> POST https://acme.xmatters.com/api/xm/1/plans/913ad31-82fe-4468-b164-4e27889e781a/forms/252ade7e-82fe-82fe-8326-4e27889e781a/triggers HTTP/1.1
> Accept: text/plain, application/json, application/*+json, */*
> Authorization: Bearer ********
> User-Agent: Xerus (EndpointClient)
> X-Trace: 11cb02b0-ccd0-4529-9d30-5023b062ab11,49492c24-41b9-4151-83a4-e0f4b5890eae
> Content-Type: application/json; charset=UTF-8
> Content-Length: 291
{
   "properties": {
      "Oven Name": "fancy pants oven",
      "Oven Name-fr": "pantalon de fantaisie four",
      "Oven Name-zh-CN": "花式裤子烤箱",
      "other-property": "It is raining today",
      "other-property-fr": "Il pleut aujourd'hui",
      "other-property-zh-CN": "今天下雨了"
   },
   "integrationUUID": "628a126f-84f2-4911-8605-76fdfdce0b3e",
   "requestId": "5b5f3c5c-38b0-44cf-bb92-6fc9e96e7fc9"
}

```

Make sure the `properties` object contains the property names you are expecting and that you have those properties on the layout of the appropriate form. 
