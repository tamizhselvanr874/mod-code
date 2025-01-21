// state.js  
let state = {  
    messages: [],  
    finalPrompt: null,  
    selectedPrompt: null,  
    awaitingFollowupResponse: false,  
    awaitingImageExplanation: false,  
    dynamicChatActive: false,  
    dynamicChatQuestionCount: 0  
  };  
    
  export function getState() {  
    return state;  
  }  
    
  export function updateState(newState) {  
    state = { ...state, ...newState };  
  }  
    
  export function addMessageToState(role, content) {  
    state.messages.push({ role, content });  
  }  