// events.js  
import { sendMessage } from './main.js';  
import { closeModal } from './ui.js';  
  
export function initializeEventListeners() {  
  const sendButton = document.getElementById('send-button');  
  const userInput = document.getElementById('user-input');  
  const newSessionButton = document.getElementById('new-session-button');  
  const modal = document.getElementById('image-modal');  
  const closeModalButton = document.querySelector('.close');  
  
  sendButton.addEventListener('click', sendMessage);  
  
  userInput.addEventListener('keypress', (event) => {  
    if (event.key === 'Enter') {  
      sendMessage();  
    }  
  });  
  
  newSessionButton.addEventListener('click', () => {  
    location.reload();  
  });  
  
  closeModalButton.addEventListener('click', () => closeModal(modal));  
  window.addEventListener('click', (event) => {  
    if (event.target === modal) {  
      closeModal(modal);  
    }  
  });  

}  