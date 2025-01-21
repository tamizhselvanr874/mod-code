// utils.js  
export async function fetchBlobsFromAzure() {  
    const storageAccountName = 'promptfreefinal';  
    const containerName = 'prompt-lib';  
    const sasToken = 'sv=2022-11-02&ss=b&srt=co&sp=rwdlaciytfx&se=2026-01-16T04:30:29Z&st=2025-01-15T20:30:29Z&spr=https&sig=t8n%2FlbK%2F%2FvmWBUz3xH1ytCqnFqy5wX1RedSWs8SJ5b4%3D';  
    
    const listUrl = `https://${storageAccountName}.blob.core.windows.net/${containerName}?restype=container&comp=list&${sasToken}`;  
    const response = await fetch(listUrl);  
    if (!response.ok) {  
      throw new Error(`Failed to fetch blob list: ${response.statusText}`);  
    }  
    
    const text = await response.text();  
    const parser = new DOMParser();  
    const xmlDoc = parser.parseFromString(text, "application/xml");  
    return Array.from(xmlDoc.getElementsByTagName("Blob")).map(blob => {  
      return { name: blob.getElementsByTagName("Name")[0].textContent };  
    });  
  }  
    
  export async function renderPrompts(blobs, promptLibrary) {  
    promptLibrary.innerHTML = ''; // Clear existing content  
    
    if (blobs.length === 0) {  
      promptLibrary.textContent = 'No prompts available.';  
      return;  
    }  
    
    for (const blob of blobs) {  
      try {  
        const promptData = await fetchBlobData(blob.name);  
        const promptCategoryElement = document.createElement('div');  
        promptCategoryElement.className = 'prompt-category';  
    
        const categoryHeading = document.createElement('h3');  
        categoryHeading.className = 'category-heading';  
        categoryHeading.dataset.category = blob.name; 
        const iconClass = await icon_code_generation(promptData.category);  
        categoryHeading.innerHTML = `<i class="${iconClass}" title="${promptData.category}"></i>`;  
    
        const promptList = document.createElement('ul');  
        promptList.className = 'prompt-list';  
        promptList.id = blob.name; // Set ID for toggling  
        promptList.style.display = 'none'; // Initially hide the prompt list  
    
        promptData.prompts.forEach(prompt => {  
          const listItem = document.createElement('li');  
          listItem.textContent = prompt.promptName;  
          listItem.dataset.promptTitle = prompt.promptName;  
          listItem.dataset.promptDescription = prompt.content;  
          promptList.appendChild(listItem);  
        });  
    
        promptCategoryElement.appendChild(categoryHeading);  
        promptCategoryElement.appendChild(promptList);  
        promptLibrary.appendChild(promptCategoryElement);  
      } catch (error) {  
        console.error('Error fetching blob data:', error);  
      }  
    }  
  }  
    
  export async function fetchBlobData(blobName) {  
    const storageAccountName = 'promptfreefinal';  
    const containerName = 'prompt-lib';  
    const sasToken = 'sv=2022-11-02&ss=b&srt=co&sp=rwdlaciytfx&se=2026-01-16T04:30:29Z&st=2025-01-15T20:30:29Z&spr=https&sig=t8n%2FlbK%2F%2FvmWBUz3xH1ytCqnFqy5wX1RedSWs8SJ5b4%3D';  
    const blobUrl = `https://${storageAccountName}.blob.core.windows.net/${containerName}/${blobName}?${sasToken}`;  
    
    const response = await fetch(blobUrl);  
    
    if (!response.ok) {  
      throw new Error(`Failed to fetch blob: ${response.statusText}`);  
    }  
    
    return await response.json();  
  }  
    
  export async function icon_code_generation(iconPreference) {  
    const prompt = `Suggest a FontAwesome icon class based on the user's preference: "${iconPreference}". The icon should be represented as a free FontAwesome class in the format: "fa-solid fa-icon-name".`;  
    
    try {  
      const response = await callAzureOpenAI([{ role: "user", content: prompt }], 50, 0.5);  
      if (response && response.choices && response.choices[0] && response.choices[0].text) {  
        const suggestedIcon = response.choices[0].text.trim();  
        const validIconFormat = /^fa-solid fa-[\w-]+$/;  
    
        if (validIconFormat.test(suggestedIcon)) {  
          return suggestedIcon;  
        }  
    
        const parsedIcon = suggestedIcon.split(/\s+/).find(icon => validIconFormat.test(icon));  
        if (parsedIcon) {  
          return parsedIcon;  
        }  
      }  
    } catch (error) {  
      console.error('Error during icon generation:', error);  
    }  
    
    const derivedIcons = { 'car': 'fa-solid fa-car' };  
    for (const [key, value] of Object.entries(derivedIcons)) {  
      if (iconPreference.toLowerCase().includes(key)) {  
        return value;  
      }  
    }  
    
    return "fa-solid fa-info-circle"; // Default icon if no match  
  }  