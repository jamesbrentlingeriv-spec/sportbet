// OpenRouter AI API Integration Module

const OPENROUTER_KEY_STORAGE = "apex_predict_openrouter_key";
const OPENROUTER_MODEL_STORAGE = "apex_predict_openrouter_model";

const openRouterClient = {
  // Save credentials to localStorage
  saveConfig: function(apiKey, model) {
    localStorage.setItem(OPENROUTER_KEY_STORAGE, apiKey.trim());
    localStorage.setItem(OPENROUTER_MODEL_STORAGE, model || "google/gemini-2.5-flash");
  },

  // Get credentials
  getConfig: function() {
    return {
      apiKey: localStorage.getItem(OPENROUTER_KEY_STORAGE) || "",
      model: localStorage.getItem(OPENROUTER_MODEL_STORAGE) || "google/gemini-2.5-flash"
    };
  },

  // Clear credentials
  clearConfig: function() {
    localStorage.removeItem(OPENROUTER_KEY_STORAGE);
    localStorage.removeItem(OPENROUTER_MODEL_STORAGE);
  },

  // Check if API Key is configured
  isConfigured: function() {
    return !!localStorage.getItem(OPENROUTER_KEY_STORAGE);
  },

  // Core API fetcher
  chatCompletion: async function(prompt, systemInstruction = "You are a professional sports analytics expert.") {
    const config = this.getConfig();
    if (!config.apiKey) {
      throw new Error("OpenRouter API key is not configured.");
    }

    try {
      const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${config.apiKey}`,
          "Content-Type": "application/json",
          "HTTP-Referer": "http://localhost:3000",
          "X-Title": "Vox Fortuna Sportsbook Terminal"
        },
        body: JSON.stringify({
          model: config.model,
          messages: [
            { role: "system", content: systemInstruction },
            { role: "user", content: prompt }
          ],
          temperature: 0.7
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error?.message || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data.choices[0]?.message?.content || "";
    } catch (error) {
      console.error("OpenRouter API error:", error);
      throw error;
    }
  }
};
