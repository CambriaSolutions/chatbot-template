// This is incomplete work. Began do construct this object,
// but due to time limitations, could not give proper types for everything.
interface State {
  config: {
    privacyPolicy: any;
    title: string;
    windowVisible: boolean;
    fullscreen: boolean;
    privacyPolicyVisible: boolean;
    googleMapsKey: string;
    centerCoordinates: string;
    activationText: string;
    feedbackUrl: string;
  },
  conversation: {
    client: null;
    clientName: null;
    messages: any[];
    webhookPayload: null;
    disableInput: boolean;
    lastUpdateTime: string;
    currentTime: string;
    timer: null;
    conversationStarted: boolean;
    suggestions: string[]
  },
  buttonBar: {
    paginationPage: any;
    visible: boolean;
    buttons: never[];
  },
  userInput: {
    value: string;
    charLength: number;
    maxExceeded: boolean;
  },
  feedbackInput: {
    wasHelpful: any;
    feedbackList: any;
    submitted: boolean;
  },
  error: {

  }
}