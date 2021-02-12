type SubjectMatter = ('cse' | 'tanf' | 'snap' | 'wfd' | 'general')

type IntentHandler = (agent: any) => Promise<any>

type IntentHandlersByName = { [name: string]: IntentHandler }

// We use the dialogflow-fulfillment definition, but add the context property
// which is not included in the definition for some reason
type Agent = import('dialogflow-fulfillment').WebhookClient & {
  context: any,
  UNSPECIFIED: any
}

type SupportType =
  'request contempt action' |
  'child support increase or decrease' |
  'employer report lump sum notification' |
  'add authorized user' |
  'inquiry' |
  'cooperation' |
  'safety' |
  'good cause' |
  'verification' |
  'request payment history' |
  'interstate' |
  'Report Information About the Parent who Pays Support' |
  'change personal information' |
  'request case closure' |
  'request payment history or record'

type Request = import("firebase-functions").Request
type Response = import("firebase-functions").Response

type HttpsFunction = (
  req: Request,
  resp: Response
) => void | Promise<void>