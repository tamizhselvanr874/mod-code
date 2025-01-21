// main.js  
import { callAzureOpenAI, generateImage, modifyPromptWithLLM } from './api.js';  
import { addMessage, showLoader, hideLoader, openModal, closeModal, createImageCard } from './ui.js';  
import { getState, updateState, addMessageToState } from './state.js';  
import { initializeEventListeners } from './events.js';  
import { fetchBlobsFromAzure, renderPrompts } from './utils.js';  
  
document.addEventListener('DOMContentLoaded', () => {  
  const chatWindow = document.getElementById('chat-window');  
  const promptLibrary = document.querySelector('.prompt-library');  
  const modal = document.getElementById('image-modal');  
  
  initializeEventListeners();  
  loadPrompts(promptLibrary);  

});  
  
async function loadPrompts(promptLibrary) {  
  try {  
    const blobs = await fetchBlobsFromAzure();  
    await renderPrompts(blobs, promptLibrary);  
  } catch (error) {  
    console.error('Error fetching prompts:', error);  
  }  
}  
  
export function sendMessage() {  
  const chatWindow = document.getElementById('chat-window');  
  const userInput = document.getElementById('user-input');  
  const message = userInput.value.trim();  
  const state = getState();  
  
  if (message) {  
    addMessage(chatWindow, "user", message);  
    showLoader(chatWindow);  
  
    if (state.awaitingImageExplanation) {  
      handleImageExplanation(message);  
    } else if (state.awaitingFollowupResponse && state.selectedPrompt) {  
      handlePromptFollowup(message);  
    } else if (state.finalPrompt) {  
      handleDirectPromptModification(message);  
    } else if (document.getElementById('direct-image-generation').checked) {  
      state.finalPrompt = message;  
      addMessage(chatWindow, "assistant", `Final Prompt: ${state.finalPrompt}`, true);  
      generateAndDisplayImage(chatWindow, state.finalPrompt);  
    } else if (state.dynamicChatActive || state.dynamicChatQuestionCount < 6) {  
      handleDynamicChat(message);  
    }  
  
    userInput.value = '';  
    hideLoader();  
  }  
}  
  
async function handleImageExplanation(message) {  
  const modifiedPrompt = await modifyPromptWithLLM(getState().finalPrompt, message);  
  if (modifiedPrompt && !modifiedPrompt.includes("Failed")) {  
    updateState({ finalPrompt: modifiedPrompt, awaitingImageExplanation: false });  
    addMessage(document.getElementById('chat-window'), "assistant", `Final Prompt: ${modifiedPrompt}`, true);  
    generateAndDisplayImage(document.getElementById('chat-window'), modifiedPrompt);  
  } else {  
    addMessage(document.getElementById('chat-window'), "assistant", "Failed to modify prompt.");  
  }  
}  
  
async function handlePromptFollowup(message) {  
  const modifiedPrompt = await modifyPromptWithLLM(getState().selectedPrompt, message);  
  if (modifiedPrompt && !modifiedPrompt.includes("Failed")) {  
    updateState({ finalPrompt: modifiedPrompt, awaitingFollowupResponse: false, selectedPrompt: null });  
    addMessage(document.getElementById('chat-window'), "assistant", `Final Prompt: ${modifiedPrompt}`, true);  
    generateAndDisplayImage(document.getElementById('chat-window'), modifiedPrompt);  
  } else {  
    addMessage(document.getElementById('chat-window'), "assistant", "Failed to modify prompt.");  
  }  
}  
  
async function handleDirectPromptModification(message) {  
  const modifiedPrompt = await modifyPromptWithLLM(getState().finalPrompt, message);  
  if (modifiedPrompt && !modifiedPrompt.includes("Failed")) {  
    updateState({ finalPrompt: modifiedPrompt });  
    addMessage(document.getElementById('chat-window'), "assistant", `Updated Final Prompt: ${modifiedPrompt}`, true);  
    generateAndDisplayImage(document.getElementById('chat-window'), modifiedPrompt);  
  } else {  
    addMessage(document.getElementById('chat-window'), "assistant", "Failed to modify prompt.");  
  }  
}  
  
async function handleDynamicChat(message) {  
  const context = getState().messages.map(msg => msg.content).join(' ');  
  const topic = QUESTION_TOPICS[getState().dynamicChatQuestionCount % QUESTION_TOPICS.length];  
  const dynamicQuestion = await generateDynamicQuestions(message, context, topic);  
  addMessage(document.getElementById('chat-window'), "assistant", dynamicQuestion);  
  updateState({ dynamicChatQuestionCount: getState().dynamicChatQuestionCount + 1 });  
  
  if (getState().dynamicChatQuestionCount === 6) {  
    setTimeout(async () => {  
      const finalPrompt = await finalizePrompt(getState().messages);  
      addMessage(document.getElementById('chat-window'), "assistant", `Final Prompt: ${finalPrompt}`);  
      generateAndDisplayImage(document.getElementById('chat-window'), finalPrompt);  
      updateState({ dynamicChatActive: false, dynamicChatQuestionCount: 0 });  
    }, 15000);  
  }  
}  
  
async function generateAndDisplayImage(chatWindow, prompt) {  
  showLoader(chatWindow);  
  const imageUrl = await generateImage(prompt);  
  hideLoader();  
  if (imageUrl && !imageUrl.includes("Failed")) {  
    addMessage(chatWindow, "assistant", `Generated Image:`);  
    createImageCard(chatWindow, imageUrl, imgSrc => openModal(modal, imgSrc));  
  } else {  
    addMessage(chatWindow, "assistant", "Bad request.");  
  }  
}  