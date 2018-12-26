/* eslint-disable  func-names */
/* eslint-disable  no-console */

const Alexa = require('ask-sdk-core');
const data = transformData(require('./models/data.en-US.json'));

function supportsAPL(handlerInput) {
  const supportedInterfaces = handlerInput.requestEnvelope.context.System.device.supportedInterfaces;
  const aplInterface = supportedInterfaces['Alexa.Presentation.APL'];
  return aplInterface!= null && aplInterface != undefined;
}

function transformData(initialData) {
  initialData.numbers.transformers = [];

  initialData.home.properties.languages.forEach(language => {
    const transformedNumbers = initialData.numbers.properties[language.code].map((word, i) => {
      return {
        word,
        numberSsml:
          `<speak><lang xml:lang="${language.ietf}"><say-as interpret-as="cardinal">${i + 1}</say-as></lang></speak>`
      };
    });
    initialData.numbers.properties[language.code] = transformedNumbers;
    initialData.numbers.transformers.push({
      inputPath: `${language.code}[*].numberSsml`,
      outputName: 'numberSpeech',
      transformer: 'ssmlToSpeech'
    });
  });

  return initialData;
}

const LaunchRequestHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'LaunchRequest';
  },
  handle(handlerInput) {
    const speechText = 
      '<speak>Welcome to Count to Ten! Which language would you like me to count to ten in? You can say a language, or say <emphasis>help</emphasis> to get a list of supported languages.</speak>'

    handlerInput.responseBuilder
      .speak(speechText)
      .reprompt(speechText);

    if (supportsAPL(handlerInput)) {
      handlerInput.responseBuilder
        .addDirective({
          type: 'Alexa.Presentation.APL.RenderDocument',
          token: 'rootToken',
          version: '1.0',
          document: require('./models/apl.json'),
          datasources: data
        });
    }

    const response = handlerInput.responseBuilder
      .getResponse();

    return response;
  },
};

function handleCountIntent(handlerInput, langIndex) {
  const lang = data.home.properties.languages[langIndex].ietf;

  if (supportsAPL(handlerInput)) {
    const commands = [
      {
        type: 'SetPage',
        componentId: 'rootPager',
        value: langIndex + 1
      }
    ];
    for(let i = 0; i < 10; i++) {
      commands.push({
        type: 'SetPage',
        componentId: lang + 'numberPager',
        value: i
      }, {
        type: 'SpeakItem',
        componentId: lang + 'number' + i
      });
    }
    commands.push({
      type: 'SetPage',
      componentId: 'rootPager',
      value: 0
    });

    handlerInput.responseBuilder
      .addDirective({
        type: 'Alexa.Presentation.APL.ExecuteCommands',
        token: 'rootToken',
        commands: [
          {
            type: 'Sequential',
            commands
          }
        ]
      });
  } else {
    const speech = [];
    for(let i = 1; i <= 10; i++) {
      speech.push(`<lang xml:lang="${lang}"><say-as interpret-as="cardinal">${i}</say-as></lang><break time="500ms" />`);
    }
    speech.push('You can choose another language, or say <emphasis>exit</emphasis> to quit.');
    handlerInput.responseBuilder
      .speak('<speak>' + speech.join('') + '</speak>');
  }

  return handlerInput.responseBuilder
    .getResponse();
}

function canHandleRequest(handlerInput, matchingIntentName, matchingPageNumber) {
  return (handlerInput.requestEnvelope.request.type === 'IntentRequest'
      && handlerInput.requestEnvelope.request.intent.name === matchingIntentName) ||
      (handlerInput.requestEnvelope.request.type === 'Alexa.Presentation.APL.UserEvent'
      && handlerInput.requestEnvelope.request.arguments[0] === 'choosePage'
      && handlerInput.requestEnvelope.request.arguments[1] === matchingPageNumber);
}

const CountInEnglishIntentHandler = {
  canHandle(handlerInput) {
    return canHandleRequest(handlerInput, 'CountInEnglishIntent', 1);
  },
  handle(handlerInput) {
    return handleCountIntent(handlerInput, 0);
  }
};

const CountInSpanishIntentHandler = {
  canHandle(handlerInput) {
    return canHandleRequest(handlerInput, 'CountInSpanishIntent', 2);
  },
  handle(handlerInput) {
    return handleCountIntent(handlerInput, 1);
  }
};

const CountInGermanIntentHandler = {
  canHandle(handlerInput) {
    return canHandleRequest(handlerInput, 'CountInGermanIntent', 3);
  },
  handle(handlerInput) {
    return handleCountIntent(handlerInput, 2);
  }
};

const CountInJapaneseIntentHandler = {
  canHandle(handlerInput) {
    return canHandleRequest(handlerInput, 'CountInJapaneseIntent', 4);
  },
  handle(handlerInput) {
    return handleCountIntent(handlerInput, 3);
  }
};

const CountInFrenchIntentHandler = {
  canHandle(handlerInput) {
    return canHandleRequest(handlerInput, 'CountInFrenchIntent', 5);
  },
  handle(handlerInput) {
    return handleCountIntent(handlerInput, 4);
  }
};

const HelpIntentHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'IntentRequest'
      && handlerInput.requestEnvelope.request.intent.name === 'AMAZON.HelpIntent';
  },
  handle(handlerInput) {
    const speechText = 'You can ask me to count in English, Spanish, German, Japanese, or French.';

    return handlerInput.responseBuilder
      .speak(speechText)
      .reprompt(speechText)
      .withSimpleCard('Count to Ten', speechText)
      .getResponse();
  },
};

const StartOverIntentHandler = {
  canHandle(handlerInput) {
    return canHandleRequest(handlerInput, 'AMAZON.StartOverIntent', 0);
  },
  handle(handlerInput) {
    const speechText = 
      'Welcome to Count to Ten! Which language would you like me to count to ten in? You can say a language, or say \"help\" to get a list of supported languages.'

    handlerInput.responseBuilder
      .speak(speechText)
      .reprompt(speechText);

    if (supportsAPL(handlerInput)) {
      handlerInput.responseBuilder
        .addDirective({
          type: 'Alexa.Presentation.APL.ExecuteCommands',
          token: 'rootToken',
          commands: [
            {
              type: 'SetPage',
              componentId: 'rootPager',
              value: 0
            }
          ]
        });
    }

    return handlerInput.responseBuilder.getResponse();
  }
}

const CancelAndStopIntentHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'IntentRequest'
      && (handlerInput.requestEnvelope.request.intent.name === 'AMAZON.CancelIntent'
        || handlerInput.requestEnvelope.request.intent.name === 'AMAZON.StopIntent');
  },
  handle(handlerInput) {
    const speechText = 'Goodbye!';

    return handlerInput.responseBuilder
      .speak(speechText)
      .withSimpleCard('Count to Ten', speechText)
      .getResponse();
  },
};

const SessionEndedRequestHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'SessionEndedRequest';
  },
  handle(handlerInput) {
    console.log(`Session ended with reason: ${handlerInput.requestEnvelope.request.reason}`);

    return handlerInput.responseBuilder.getResponse();
  },
};

const ErrorHandler = {
  canHandle() {
    return true;
  },
  handle(handlerInput, error) {
    console.log(`Error handled: ${error.message}`);

    return handlerInput.responseBuilder
      .speak('Sorry, I didn\'t understand that. Please say again.')
      .reprompt('Sorry, I didn\'t understand that. Please say again.')
      .getResponse();
  },
};

const skillBuilder = Alexa.SkillBuilders.custom();

exports.handler = skillBuilder
  .addRequestHandlers(
    LaunchRequestHandler,
    CountInEnglishIntentHandler,
    CountInSpanishIntentHandler,
    CountInGermanIntentHandler,
    CountInJapaneseIntentHandler,
    CountInFrenchIntentHandler,
    StartOverIntentHandler,
    HelpIntentHandler,
    CancelAndStopIntentHandler,
    SessionEndedRequestHandler
  )
  .addErrorHandlers(ErrorHandler)
  .lambda();