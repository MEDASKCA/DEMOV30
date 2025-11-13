import { AzureOpenAI } from 'openai';

/**
 * Azure OpenAI Client for TOM AI
 * Uses OpenAI SDK v4 with Azure configuration
 */

let client: AzureOpenAI | null = null;

export function getAzureOpenAIClient(): AzureOpenAI {
  if (!client) {
    const apiKey = process.env.AZURE_OPENAI_API_KEY;
    const endpoint = process.env.AZURE_OPENAI_ENDPOINT;
    const apiVersion = '2024-08-01-preview';

    if (!apiKey || !endpoint) {
      throw new Error('Azure OpenAI credentials not configured. Please set AZURE_OPENAI_API_KEY and AZURE_OPENAI_ENDPOINT in environment variables.');
    }

    client = new AzureOpenAI({
      apiKey,
      endpoint,
      apiVersion,
      deployment: process.env.AZURE_OPENAI_DEPLOYMENT_NAME || 'gpt-4o',
    });

    console.log('✅ Azure OpenAI client initialized');
  }

  return client;
}

export async function queryAzureOpenAI(userMessage: string, systemPrompt?: string): Promise<string> {
  try {
    const client = getAzureOpenAIClient();
    const deploymentName = process.env.AZURE_OPENAI_DEPLOYMENT_NAME || 'gpt-4o';

    console.log('🔵 Azure OpenAI - Querying deployment:', deploymentName);

    const messages: any[] = [];

    if (systemPrompt) {
      messages.push({
        role: 'system',
        content: systemPrompt,
      });
    }

    messages.push({
      role: 'user',
      content: userMessage,
    });

    const response = await client.chat.completions.create({
      model: deploymentName,
      messages,
      temperature: 0.7,
      max_tokens: 1500,
    });

    const content = response.choices[0]?.message?.content || '';
    console.log('✅ Azure OpenAI - Response received:', content.substring(0, 100) + '...');

    return content;
  } catch (error: any) {
    console.error('❌ Azure OpenAI Error:', error);
    throw error;
  }
}

export async function streamAzureOpenAI(userMessage: string, systemPrompt?: string): Promise<ReadableStream> {
  const client = getAzureOpenAIClient();
  const deploymentName = process.env.AZURE_OPENAI_DEPLOYMENT_NAME || 'gpt-4o';

  console.log('🔵 Azure OpenAI - Streaming from deployment:', deploymentName);

  const messages: any[] = [];

  if (systemPrompt) {
    messages.push({
      role: 'system',
      content: systemPrompt,
    });
  }

  messages.push({
    role: 'user',
    content: userMessage,
  });

  const stream = await client.chat.completions.create({
    model: deploymentName,
    messages,
    temperature: 0.7,
    max_tokens: 1500,
    stream: true,
  });

  // Create a ReadableStream from the Azure OpenAI stream
  return new ReadableStream({
    async start(controller) {
      try {
        for await (const chunk of stream) {
          const content = chunk.choices[0]?.delta?.content || '';
          if (content) {
            controller.enqueue(new TextEncoder().encode(content));
          }
        }
        controller.close();
      } catch (error) {
        controller.error(error);
      }
    },
  });
}
