# Groq Chatbot Setup

The chatbot now uses **Groq** instead of Gemini for faster and more reliable responses.

## Features
- **Model**: llama-3.3-70b-versatile (Fast and capable)
- **Speed**: Much faster than Gemini
- **Reliability**: Better error handling and consistent responses
- **Context**: Knows about ABV-IIITM Gwalior, courses, facilities, and ERP system

## API Key Already Configured
The Groq API key is already set in `.env`:
```
GROQ_API_KEY=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
```

## How It Works
1. User sends a message through the chatbot UI
2. Backend calls Groq API with conversation history
3. Groq responds using llama-3.3-70b-versatile model
4. Response is sent back to the user

## Testing
1. Start the server: `npm run dev` (in server folder)
2. Start the client: `npm run dev` (in client folder)
3. Click the chatbot button in the bottom-right corner
4. Ask questions like:
   - "What courses are available?"
   - "Tell me about ABV-IIITM Gwalior"
   - "How do I enroll in courses?"
   - "What facilities are available on campus?"

## Advantages over Gemini
- ✅ Faster response times
- ✅ No model version issues
- ✅ Better conversation handling
- ✅ More reliable API
- ✅ Simpler implementation

## Get Your Own Groq API Key (Optional)
If you want to use your own key:
1. Visit https://console.groq.com
2. Sign up for a free account
3. Generate an API key
4. Replace the key in `.env`
