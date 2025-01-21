// ui.js  
export function addMessage(chatWindow, role, content, isHTML = false) {  
    const messageElement = document.createElement('div');  
    messageElement.className = role === "user" ? 'message user-message' : 'message assistant-message';  
    
    const messageContent = document.createElement('div');  
    messageContent.className = 'message-content';  
    
    if (isHTML) {  
      messageContent.innerHTML = content;  
    } else {  
      messageContent.textContent = content;  
    }  
    
    if (role === "assistant") {  
      const icon = document.createElement('i');  
      icon.className = 'fa-solid fa-palette message-icon';  
      messageElement.appendChild(icon);  
    }  
    
    messageElement.appendChild(messageContent);  
    chatWindow.appendChild(messageElement);  
    chatWindow.scrollTop = chatWindow.scrollHeight;  
  }  
    
  export function showLoader(chatWindow) {  
    const loaderElement = document.createElement('div');  
    loaderElement.className = 'loader';  
    loaderElement.id = 'loader';  
    
    for (let i = 0; i < 3; i++) {  
      const dot = document.createElement('div');  
      dot.className = 'dot';  
      loaderElement.appendChild(dot);  
    }  
    
    chatWindow.appendChild(loaderElement);  
    chatWindow.scrollTop = chatWindow.scrollHeight;  
  }  
    
  export function hideLoader() {  
    const loaderElement = document.getElementById('loader');  
    if (loaderElement) {  
      loaderElement.remove();  
    }  
  }  
    
  export function openModal(modal, imgSrc) {  
    modal.style.display = 'block';  
    document.getElementById('enlarged-img').src = imgSrc;  
    document.getElementById('download-link').href = imgSrc;  
  }  
    
  export function closeModal(modal) {  
    modal.style.display = 'none';  
  }  
    
  export function createImageCard(chatWindow, imageUrl, openModalFunc) {  
    const imageCard = document.createElement('div');  
    imageCard.className = 'image-card';  
    
    const img = document.createElement('img');  
    img.src = imageUrl;  
    img.alt = 'Generated Image';  
    img.onclick = () => openModalFunc(img.src);  
    
    const options = document.createElement('div');  
    options.className = 'image-card-options';  
    
    const zoomButton = document.createElement('button');  
    zoomButton.innerHTML = '<i class="fa fa-search-plus"></i>';  
    zoomButton.onclick = () => openModalFunc(img.src);  
    
    const downloadButton = document.createElement('button');  
    downloadButton.innerHTML = '<i class="fa fa-download"></i>';  
    downloadButton.onclick = () => window.open(imageUrl, '_blank');  
    
    const regenerateButton = document.createElement('button');  
    regenerateButton.innerHTML = '<i class="fa fa-sync-alt"></i>';  
    regenerateButton.onclick = () => regenerateImage(finalPrompt); // Ensure regenerateImage is available  
    
    options.appendChild(zoomButton);  
    options.appendChild(downloadButton);  
    options.appendChild(regenerateButton);  
    
    imageCard.appendChild(img);  
    imageCard.appendChild(options);  
    chatWindow.appendChild(imageCard);  
    
    chatWindow.scrollTop = chatWindow.scrollHeight;  
  }  