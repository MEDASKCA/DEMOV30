# Azure OpenAI Setup Guide for TOM AI

This guide will help you set up Azure OpenAI for the Theatre Operations Manager AI assistant.

## Prerequisites

- An Azure subscription
- Access to Azure OpenAI Service (requires approval from Microsoft)

## Step 1: Create Azure OpenAI Resource

1. Go to the [Azure Portal](https://portal.azure.com)
2. Click "Create a resource"
3. Search for "Azure OpenAI"
4. Click "Create"
5. Fill in the required information:
   - **Subscription**: Your Azure subscription
   - **Resource group**: Create new or use existing
   - **Region**: Choose UK South or UK West for NHS compliance
   - **Name**: e.g., "tom-ai-openai"
   - **Pricing tier**: Standard S0
6. Click "Review + create" then "Create"

## Step 2: Deploy Models

### Deploy GPT-4 Model (Required)

1. In your Azure OpenAI resource, go to "Model deployments"
2. Click "Create new deployment"
3. Select:
   - **Model**: gpt-4 or gpt-4-turbo
   - **Deployment name**: `gpt-4` (this will be used in your config)
   - **Model version**: Latest available
4. Click "Create"

### Deploy TTS Model (Optional - for realistic voice)

1. Click "Create new deployment" again
2. Select:
   - **Model**: tts-1 or tts-1-hd (tts-1-hd for higher quality)
   - **Deployment name**: `tts`
   - **Model version**: Latest available
3. Click "Create"

**Note**: TTS (Text-to-Speech) gives you ChatGPT-quality voice instead of robotic browser voice. It's optional but highly recommended!

## Step 3: Get Your API Credentials

1. In your Azure OpenAI resource, go to "Keys and Endpoint"
2. Copy the following:
   - **KEY 1** or **KEY 2**: This is your API key
   - **Endpoint**: This is your endpoint URL (e.g., https://your-resource.openai.azure.com/)

## Step 4: Configure TOM AI

1. Copy `.env.local.example` to `.env.local` in the project root:
   ```bash
   cp .env.local.example .env.local
   ```

2. Edit `.env.local` and add your Azure OpenAI credentials:
   ```env
   # Azure OpenAI Configuration
   AZURE_OPENAI_API_KEY=your_api_key_here
   AZURE_OPENAI_ENDPOINT=https://your-resource-name.openai.azure.com/
   AZURE_OPENAI_DEPLOYMENT_NAME=gpt-4
   AZURE_OPENAI_TTS_DEPLOYMENT_NAME=tts
   AZURE_OPENAI_API_VERSION=2024-02-15-preview
   ```

3. Replace:
   - `your_api_key_here` with your KEY 1 or KEY 2
   - `your-resource-name` with your actual Azure OpenAI resource name
   - `gpt-4` with your GPT-4 deployment name if different
   - `tts` with your TTS deployment name if different (or omit if not using TTS)

## Step 5: Test the Setup

1. Start your development server:
   ```bash
   npm run dev
   ```

2. Navigate to the TOM AI chat panel in the application

3. Try asking a question:
   - "What's today's theatre schedule?"
   - "Show me staff availability"
   - "What's the status of Theatre 3?"

4. You should see streaming responses from Azure OpenAI with real-time data from Firebase

## Features

### RAG (Retrieval-Augmented Generation)
TOM AI uses RAG to provide accurate, data-grounded responses:
- Queries Firebase for current theatre data
- Passes relevant context to GPT-4
- Generates intelligent, contextual responses

### Function Calling
The AI can call these functions to retrieve data:
- `getTodaySchedule` - Complete theatre schedule for today
- `getStaffAvailability` - Available staff and their roles
- `getTheatreInfo` - Specific theatre information
- `getEfficiencyMetrics` - Performance analytics
- `getTheatreReadiness` - Theatre status overview
- `getCasesByPriority` - Cases by priority level

### Streaming Responses
- Real-time streaming for faster perceived response time
- Automatic fallback to non-streaming if unavailable

### Voice Support

**With Azure TTS (ChatGPT-quality):**
- Natural, human-like voice (same as ChatGPT)
- Voice: "Onyx" - Deep, professional male voice
- Realistic intonation and emotion
- Cost: ~£0.012/1K characters

**Fallback (Browser Speech):**
- Used if Azure TTS not configured or fails
- Robotic, Siri-like voice
- Free, works offline
- Voice input using Web Speech API (always enabled)

**Available Azure Voices:**
- `alloy` - Neutral, versatile
- `echo` - Male, warm
- `fable` - British accent, expressive
- `onyx` - Deep, professional male (default for TOM AI)
- `nova` - Female, friendly
- `shimmer` - Female, bright

To change voice, edit `components/TomAIChatPanel.tsx` line 246

## Troubleshooting

### "Azure OpenAI credentials not configured"
- Check that your `.env.local` file exists and contains the correct credentials
- Restart your development server after adding credentials

### "Access denied" or 403 errors
- Verify your Azure subscription has Azure OpenAI access
- Check that your API key is correct and not expired
- Ensure your endpoint URL is correct

### Model not found
- Verify the deployment name matches `AZURE_OPENAI_DEPLOYMENT_NAME`
- Check that the model is deployed in your Azure OpenAI resource

### Fallback to rule-based system
- This is normal if Azure OpenAI is not configured
- The system will still work but with simpler pattern-matching responses

## Cost Considerations

Azure OpenAI pricing (approximate):
- **GPT-4 Turbo**: ~£0.008/1K input tokens, ~£0.024/1K output tokens
- **GPT-4**: ~£0.024/1K input tokens, ~£0.048/1K output tokens
- **TTS (tts-1)**: ~£0.012/1K characters
- **TTS (tts-1-hd)**: ~£0.024/1K characters (higher quality)

Estimated monthly cost for typical NHS theatre use:

**Scenario 1: Chat Only (no voice)**
- 100 queries/day × 30 days = 3,000 queries/month
- Average 500 tokens per query = 1.5M tokens/month
- **Cost: £30-40/month**

**Scenario 2: Chat + Voice**
- 100 queries/day × 30 days = 3,000 queries/month
- 50 voice responses/day × 200 characters = 300K characters/month
- **Chat cost: £30-40/month**
- **Voice cost: £3-5/month**
- **Total: £33-45/month**

**With your £200 credits:**
- Heavy testing for 6 days: ~£30-50 total
- You'll have £150-170 unused when they expire!

## Data Privacy & Compliance

### Azure OpenAI for NHS
- **Data residency**: Deploy in UK South/UK West regions
- **No training**: Your data is NOT used to train models
- **Encryption**: Data encrypted in transit and at rest
- **GDPR compliant**: Meets NHS data protection requirements
- **No patient data**: TOM AI only accesses operational data (schedules, staff, metrics)

### Best Practices
1. Never send patient identifiable information to the AI
2. Use only operational data (theatre schedules, staff rosters, metrics)
3. Enable Azure logging for audit trails
4. Review Azure OpenAI terms of service for healthcare use

## Support

For issues or questions:
1. Check Azure OpenAI documentation: https://learn.microsoft.com/azure/ai-services/openai/
2. Review the application logs in browser console
3. Contact your Azure support team for subscription/access issues

## Next Steps

Once configured, you can:
- Customize the system prompt in `lib/azureOpenAIService.ts`
- Add new function calls for additional data sources
- Adjust model parameters (temperature, max tokens)
- Implement conversation history for context-aware responses
