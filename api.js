// api.js  
const azureEndpoint = process.env.AZURE_ENDPOINT;  
const apiKey = process.env.API_KEY;  
const apiVersion = process.env.API_VERSION;  
const model = process.env.MODEL;   
const IMAGE_GENERATION_URL = process.env.IMAGE_GENERATION_URL;  
  
export async function callAzureOpenAI(messages, maxTokens, temperature) {  
  try {  
    const response = await fetch(`${azureEndpoint}/openai/deployments/${model}/chat/completions?api-version=${apiVersion}`, {  
      method: 'POST',  
      headers: {  
        'Content-Type': 'application/json',  
        'api-key': apiKey  
      },  
      body: JSON.stringify({ messages, temperature, max_tokens: maxTokens })  
    });  
    const data = await response.json();  
    if (!data.choices || !data.choices[0] || !data.choices[0].message) {  
      throw new Error("Invalid response structure");  
    }  
    return data.choices[0].message.content.trim();  
  } catch (error) {  
    console.error('Error in API call:', error);  
    return "Error in API call.";  
  }  
}  
  
export async function generateImage(prompt) {  
  const retryCount = 3;  
  const initialDelay = 1000;  
  
  async function fetchImageWithRetry(currentRetry = 0) {  
    try {  
      const response = await fetch(IMAGE_GENERATION_URL, {  
        method: 'POST',  
        headers: { 'Content-Type': 'application/json' },  
        body: JSON.stringify({ prompt })  
      });  
  
      if (!response.ok) {  
        if (response.status === 403) throw new Error("Generation of copyrighted content is restricted.");  
        if (response.status === 400) throw new Error("Bad request. Please check the prompt format.");  
        throw new Error("Network response was not ok");  
      }  
  
      const data = await response.json();  
      if (data.imageUrls) return data.imageUrls[0];  
      throw new Error("No image URL returned");  
    } catch (error) {  
      console.error("Error generating image:", error);  
      if (currentRetry < retryCount) {  
        const delay = initialDelay * Math.pow(2, currentRetry);  
        await new Promise(resolve => setTimeout(resolve, delay));  
        return fetchImageWithRetry(currentRetry + 1);  
      } else {  
        return "Failed to generate image.";  
      }  
    }  
  }  
  
  return fetchImageWithRetry();  
}  
  
export async function modifyPromptWithLLM(initialPrompt, userInstruction) {  
  const prompt = `You are an assistant that modifies image descriptions based on user input.\nInitial Description:\n"${initialPrompt}"\nUser Instruction:\n"${userInstruction}"\nPlease update the initial description by incorporating the user's instruction without changing much...`;  
  return await callAzureOpenAI([  
    { role: "system", content: "You are skilled at updating image descriptions..." },  
    { role: "user", content: prompt }  
  ], 300, 0.7) || "Failed to modify prompt.";  
}  
  
