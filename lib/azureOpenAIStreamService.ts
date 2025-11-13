import { OpenAIClient, AzureKeyCredential } from '@azure/openai';
import { db } from './firebase';
import { collection, getDocs, query, where, orderBy, limit } from 'firebase/firestore';
import { format } from 'date-fns';

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant' | 'function';
  content: string;
  name?: string;
}

/**
 * Azure OpenAI Streaming Service for TOM AI
 */
export class AzureOpenAIStreamService {
  private static client: OpenAIClient | null = null;

  private static getClient(): OpenAIClient {
    if (!this.client) {
      const apiKey = process.env.AZURE_OPENAI_API_KEY;
      const endpoint = process.env.AZURE_OPENAI_ENDPOINT;

      if (!apiKey || !endpoint) {
        throw new Error('Azure OpenAI credentials not configured');
      }

      this.client = new OpenAIClient(
        endpoint,
        new AzureKeyCredential(apiKey)
      );
    }

    return this.client;
  }

  /**
   * Stream a chat response with RAG
   */
  static async streamQuery(userQuery: string): Promise<ReadableStream> {
    const client = this.getClient();
    const deploymentName = process.env.AZURE_OPENAI_DEPLOYMENT_NAME || 'gpt-4';

    // System message
    const messages: ChatMessage[] = [
      {
        role: 'system',
        content: `You are TOM AI, an intelligent assistant for NHS theatre operations management at Barts Health NHS Trust.

Your role is to help theatre staff with theatre operations. Be concise, professional, and helpful.

Current date: ${format(new Date(), 'EEEE, d MMMM yyyy')}`
      },
      {
        role: 'user',
        content: userQuery
      }
    ];

    const events = await client.streamChatCompletions(
      deploymentName,
      messages as any,
      {
        temperature: 0.7,
        maxTokens: 1500
      }
    );

    // Create a readable stream that yields chunks
    return new ReadableStream({
      async start(controller) {
        try {
          for await (const event of events) {
            for (const choice of event.choices) {
              const content = choice.delta?.content || '';
              if (content) {
                controller.enqueue(new TextEncoder().encode(content));
              }
            }
          }
          controller.close();
        } catch (error) {
          controller.error(error);
        }
      }
    });
  }
}
