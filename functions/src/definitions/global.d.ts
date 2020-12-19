type SubjectMatter = ('mscj')

type IntentHandler = (agent: any) => Promise<any>

type IntentHandlersByName = { [name: string]: IntentHandler }

// We use the dialogflow-fulfillment definition, but add the context property
// which is not included in the definition for some reason
type Agent = import('dialogflow-fulfillment').WebhookClient & {
  context: any,
  UNSPECIFIED: any
}

type Request = import("firebase-functions").Request
type Response = import("firebase-functions").Response

type HttpsFunction = (
  req: Request,
  resp: Response
) => void | Promise<void>