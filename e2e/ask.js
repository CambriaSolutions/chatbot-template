function ask(sessionClient, sessionPath, question) {
  return new Promise((resolve, reject) => {
    const dfRequest = {
      session: sessionPath,
      queryInput: { text: { text: question, languageCode: 'en-US' } },
    };

    sessionClient
      .detectIntent(dfRequest)
      .then(responses => {
        let constructedReply = {
          replies: [],
          suggestions: []
        };
        constructedReply.intent = responses[0].queryResult.intent.displayName;
        constructedReply.contexts = [];
        for (const index in responses[0].queryResult.outputContexts) {
          const outputContext = responses[0].queryResult.outputContexts[index];
          constructedReply.contexts.push(outputContext.name.split('/').pop());
        }

        for (const index in responses[0].queryResult.fulfillmentMessages) {
          const message = responses[0].queryResult.fulfillmentMessages[index];
          switch (message.message) {
            case 'text':
              constructedReply.replies.push(message.text.text);
              break;
            case 'quickReplies':
              constructedReply.suggestions.push(message.quickReplies.quickReplies);
              break;
          }
        }

        resolve(constructedReply);
      })
      .catch(err => {
        reject(err);
      });
  });
}
module.exports = ask;