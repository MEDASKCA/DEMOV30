import { OpenAIClient, AzureKeyCredential } from '@azure/openai';
import { db } from './firebase';
import { collection, getDocs, query, where, orderBy, limit } from 'firebase/firestore';
import { format } from 'date-fns';

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant' | 'function';
  content: string;
  name?: string;
}

export interface RAGResponse {
  success: boolean;
  message: string;
  data?: any;
}

/**
 * Azure OpenAI RAG Service - Retrieval-Augmented Generation for theatre operations
 */
export class AzureOpenAIService {
  private static client: OpenAIClient | null = null;

  /**
   * Initialize Azure OpenAI client
   */
  private static getClient(): OpenAIClient {
    if (!this.client) {
      const apiKey = process.env.AZURE_OPENAI_API_KEY;
      const endpoint = process.env.AZURE_OPENAI_ENDPOINT;

      if (!apiKey || !endpoint) {
        throw new Error('Azure OpenAI credentials not configured. Please add AZURE_OPENAI_API_KEY and AZURE_OPENAI_ENDPOINT to your .env.local file.');
      }

      this.client = new OpenAIClient(
        endpoint,
        new AzureKeyCredential(apiKey)
      );
    }

    return this.client;
  }

  /**
   * Main RAG query processor
   */
  static async processQuery(userQuery: string): Promise<RAGResponse> {
    try {
      console.log('🔵 Azure OpenAI Service - Processing query:', userQuery);

      // Check if in demo mode
      if ((db as any).type === 'demo') {
        console.log('⚠️ Azure OpenAI Service - Database in demo mode');
        return {
          success: false,
          message: "I'm currently in demo mode. Please configure Firebase credentials to access real-time theatre operations data."
        };
      }

      const client = this.getClient();
      const deploymentName = process.env.AZURE_OPENAI_DEPLOYMENT_NAME || 'gpt-4';
      console.log('🔵 Azure OpenAI Deployment:', deploymentName);

      // Define available functions for the AI to call
      const functions = [
        {
          name: 'getTodaySchedule',
          description: 'Get the complete schedule of all theatre cases for today',
          parameters: {
            type: 'object',
            properties: {},
            required: []
          }
        },
        {
          name: 'getTomorrowSchedule',
          description: 'Get the complete schedule of all theatre cases for tomorrow',
          parameters: {
            type: 'object',
            properties: {},
            required: []
          }
        },
        {
          name: 'getScheduleForDate',
          description: 'Get the schedule for a specific date',
          parameters: {
            type: 'object',
            properties: {
              date: {
                type: 'string',
                description: 'The date in format YYYY-MM-DD, or relative terms like "tomorrow", "next monday", etc.'
              }
            },
            required: ['date']
          }
        },
        {
          name: 'getStaffAvailability',
          description: 'Get information about available staff members, their roles, and specialties',
          parameters: {
            type: 'object',
            properties: {},
            required: []
          }
        },
        {
          name: 'getTheatreInfo',
          description: 'Get information about a specific theatre including its schedule and status',
          parameters: {
            type: 'object',
            properties: {
              theatreNumber: {
                type: 'string',
                description: 'The theatre number (e.g., "1", "2", "3")'
              }
            },
            required: ['theatreNumber']
          }
        },
        {
          name: 'getEfficiencyMetrics',
          description: 'Get theatre efficiency metrics and performance analytics',
          parameters: {
            type: 'object',
            properties: {},
            required: []
          }
        },
        {
          name: 'getTheatreReadiness',
          description: 'Get the readiness status of all theatres',
          parameters: {
            type: 'object',
            properties: {},
            required: []
          }
        },
        {
          name: 'getCasesByPriority',
          description: 'Get cases filtered by priority level (routine/elective, urgent, or emergency)',
          parameters: {
            type: 'object',
            properties: {
              priority: {
                type: 'string',
                enum: ['routine', 'urgent', 'emergency'],
                description: 'The priority level of cases to retrieve'
              }
            },
            required: ['priority']
          }
        }
      ];

      // Initial system message to set context
      const messages: ChatMessage[] = [
        {
          role: 'system',
          content: `You are TOM AI, an intelligent assistant for NHS theatre operations management at Barts Health NHS Trust.

Your role is to help theatre staff with:
- Accessing and interpreting theatre schedules
- Finding staff availability and allocations
- Providing performance metrics and analytics
- Answering questions about theatre operations
- Helping with operational decision-making

You have access to real-time data from the theatre management system through function calls.
When answering questions:
1. Use the appropriate function to retrieve current data
2. Provide clear, concise, and actionable information
3. Use professional NHS terminology
4. Format responses for readability
5. Be helpful and supportive to busy theatre staff

Current date: ${format(new Date(), 'EEEE, d MMMM yyyy')}`
        },
        {
          role: 'user',
          content: userQuery
        }
      ];

      // First API call to determine which functions to call
      let response = await client.getChatCompletions(
        deploymentName,
        messages as any,
        {
          functions: functions as any,
          functionCall: 'auto',
          temperature: 0.7,
          maxTokens: 1500
        }
      );

      let assistantMessage = response.choices[0].message;

      // Handle function calls
      while (assistantMessage.functionCall) {
        const functionName = assistantMessage.functionCall.name;
        const functionArgs = JSON.parse(assistantMessage.functionCall.arguments || '{}');
        console.log(`🔵 Azure OpenAI - Calling function: ${functionName}`, functionArgs);

        // Execute the requested function
        const functionResult = await this.executeFunction(functionName, functionArgs);
        console.log(`🔵 Azure OpenAI - Function result:`, functionResult);

        // Add function call and result to messages
        messages.push({
          role: 'assistant',
          content: assistantMessage.content || '',
          name: functionName
        } as any);

        messages.push({
          role: 'function',
          name: functionName,
          content: JSON.stringify(functionResult)
        } as any);

        // Call API again with function result
        response = await client.getChatCompletions(
          deploymentName,
          messages as any,
          {
            functions: functions as any,
            functionCall: 'auto',
            temperature: 0.7,
            maxTokens: 1500
          }
        );

        assistantMessage = response.choices[0].message;
      }

      const finalMessage = assistantMessage.content || 'I apologize, but I was unable to generate a response.';
      console.log('🔵 Azure OpenAI - Final response:', finalMessage);

      return {
        success: true,
        message: finalMessage
      };

    } catch (error: any) {
      console.error('❌ Azure OpenAI RAG Error:', error);

      if (error.message?.includes('credentials not configured')) {
        return {
          success: false,
          message: "Azure OpenAI is not configured. Please add your Azure OpenAI credentials to the .env.local file."
        };
      }

      return {
        success: false,
        message: "I encountered an error processing your request. Please try again or rephrase your question."
      };
    }
  }

  /**
   * Execute a function call requested by the AI
   */
  private static async executeFunction(functionName: string, args: any): Promise<any> {
    switch (functionName) {
      case 'getTodaySchedule':
        return await this.getTodaySchedule();

      case 'getTomorrowSchedule':
        return await this.getTomorrowSchedule();

      case 'getScheduleForDate':
        return await this.getScheduleForDate(args.date);

      case 'getStaffAvailability':
        return await this.getStaffAvailability();

      case 'getTheatreInfo':
        return await this.getTheatreInfo(args.theatreNumber);

      case 'getEfficiencyMetrics':
        return await this.getEfficiencyMetrics();

      case 'getTheatreReadiness':
        return await this.getTheatreReadiness();

      case 'getCasesByPriority':
        return await this.getCasesByPriority(args.priority);

      default:
        return { error: 'Unknown function' };
    }
  }

  /**
   * Firebase query functions (RAG data retrieval)
   */

  private static async getTodaySchedule(): Promise<any> {
    try {
      const today = format(new Date(), 'yyyy-MM-dd');
      const casesRef = collection(db, 'cases');
      const q = query(casesRef, where('date', '==', today), orderBy('scheduledTime'));
      const snapshot = await getDocs(q);

      if (snapshot.empty) {
        return { message: 'No cases scheduled for today', cases: [] };
      }

      const cases = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      return {
        message: `Found ${cases.length} cases scheduled for today`,
        totalCases: cases.length,
        cases: cases.map((c: any) => ({
          theatre: c.theatre,
          scheduledTime: c.scheduledTime,
          procedureName: c.procedureName,
          surgeon: c.surgeon,
          status: c.status,
          priority: c.priority,
          estimatedDuration: c.estimatedDuration,
          specialty: c.specialty
        }))
      };
    } catch (error) {
      return { error: 'Unable to retrieve today\'s schedule', details: String(error) };
    }
  }

  private static async getTomorrowSchedule(): Promise<any> {
    try {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const tomorrowStr = format(tomorrow, 'yyyy-MM-dd');

      const casesRef = collection(db, 'cases');
      const q = query(casesRef, where('date', '==', tomorrowStr), orderBy('scheduledTime'));
      const snapshot = await getDocs(q);

      if (snapshot.empty) {
        return { message: 'No cases scheduled for tomorrow', cases: [] };
      }

      const cases = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      return {
        message: `Found ${cases.length} cases scheduled for tomorrow (${format(tomorrow, 'EEEE, d MMMM yyyy')})`,
        date: tomorrowStr,
        totalCases: cases.length,
        cases: cases.map((c: any) => ({
          theatre: c.theatre,
          scheduledTime: c.scheduledTime,
          procedureName: c.procedureName,
          surgeon: c.surgeon,
          status: c.status,
          priority: c.priority,
          estimatedDuration: c.estimatedDuration,
          specialty: c.specialty
        }))
      };
    } catch (error) {
      return { error: 'Unable to retrieve tomorrow\'s schedule', details: String(error) };
    }
  }

  private static async getScheduleForDate(dateStr: string): Promise<any> {
    try {
      // Parse relative dates like "tomorrow", "next week", etc.
      let targetDate: Date;

      if (dateStr.toLowerCase() === 'tomorrow') {
        targetDate = new Date();
        targetDate.setDate(targetDate.getDate() + 1);
      } else {
        // Assume it's already in YYYY-MM-DD format
        targetDate = new Date(dateStr);
      }

      const dateFormatted = format(targetDate, 'yyyy-MM-dd');
      const casesRef = collection(db, 'cases');
      const q = query(casesRef, where('date', '==', dateFormatted), orderBy('scheduledTime'));
      const snapshot = await getDocs(q);

      if (snapshot.empty) {
        return { message: `No cases scheduled for ${format(targetDate, 'EEEE, d MMMM yyyy')}`, cases: [] };
      }

      const cases = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      return {
        message: `Found ${cases.length} cases scheduled for ${format(targetDate, 'EEEE, d MMMM yyyy')}`,
        date: dateFormatted,
        totalCases: cases.length,
        cases: cases.map((c: any) => ({
          theatre: c.theatre,
          scheduledTime: c.scheduledTime,
          procedureName: c.procedureName,
          surgeon: c.surgeon,
          status: c.status,
          priority: c.priority,
          estimatedDuration: c.estimatedDuration,
          specialty: c.specialty
        }))
      };
    } catch (error) {
      return { error: `Unable to retrieve schedule for ${dateStr}`, details: String(error) };
    }
  }

  private static async getStaffAvailability(): Promise<any> {
    try {
      const staffRef = collection(db, 'staff');
      const q = query(staffRef, where('isActive', '==', true));
      const snapshot = await getDocs(q);

      if (snapshot.empty) {
        return { message: 'No active staff members found', staff: [] };
      }

      const staff = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      // Group by role
      const byRole: { [key: string]: any[] } = {};
      staff.forEach((member: any) => {
        if (!byRole[member.role]) {
          byRole[member.role] = [];
        }
        byRole[member.role].push({
          name: `${member.firstName} ${member.lastName}`,
          specialties: member.specialties || [],
          grade: member.grade
        });
      });

      return {
        message: `Found ${staff.length} active staff members`,
        totalStaff: staff.length,
        staffByRole: byRole
      };
    } catch (error) {
      return { error: 'Unable to retrieve staff availability', details: String(error) };
    }
  }

  private static async getTheatreInfo(theatreNumber: string): Promise<any> {
    try {
      const today = format(new Date(), 'yyyy-MM-dd');
      const casesRef = collection(db, 'cases');
      const q = query(
        casesRef,
        where('date', '==', today),
        where('theatre', '==', `Theatre ${theatreNumber}`)
      );
      const snapshot = await getDocs(q);

      const cases = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      return {
        theatreNumber,
        casesScheduled: cases.length,
        cases: cases.map((c: any) => ({
          scheduledTime: c.scheduledTime,
          procedureName: c.procedureName,
          surgeon: c.surgeon,
          status: c.status,
          estimatedDuration: c.estimatedDuration
        }))
      };
    } catch (error) {
      return { error: `Unable to retrieve Theatre ${theatreNumber} information`, details: String(error) };
    }
  }

  private static async getEfficiencyMetrics(): Promise<any> {
    try {
      const metricsRef = collection(db, 'theatre_efficiency');
      const q = query(metricsRef, orderBy('date', 'desc'), limit(7));
      const snapshot = await getDocs(q);

      if (snapshot.empty) {
        return { message: 'No performance metrics available yet' };
      }

      const metrics = snapshot.docs.map(doc => doc.data());
      const latest = metrics[0];

      return {
        latestMetrics: {
          utilization: latest.utilization,
          onTimeStarts: latest.onTimeStarts,
          avgTurnover: latest.avgTurnover,
          casesCompleted: latest.casesCompleted
        },
        weeklyTrend: metrics.map((m: any) => ({
          date: m.date,
          utilization: m.utilization,
          casesCompleted: m.casesCompleted
        }))
      };
    } catch (error) {
      return { error: 'Unable to retrieve performance metrics', details: String(error) };
    }
  }

  private static async getTheatreReadiness(): Promise<any> {
    try {
      const today = format(new Date(), 'yyyy-MM-dd');
      const allocationsRef = collection(db, 'theatreAllocations');
      const q = query(allocationsRef, where('date', '==', today));
      const snapshot = await getDocs(q);

      if (snapshot.empty) {
        return { message: 'No theatre allocations found for today' };
      }

      const allocations = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      return {
        message: `Found ${allocations.length} theatre allocations`,
        theatres: allocations.map((a: any) => ({
          theatre: a.theatre,
          specialty: a.specialty,
          status: a.status,
          surgeon: a.surgeon
        }))
      };
    } catch (error) {
      return { error: 'Unable to retrieve theatre readiness status', details: String(error) };
    }
  }

  private static async getCasesByPriority(priority: string): Promise<any> {
    try {
      const today = format(new Date(), 'yyyy-MM-dd');
      const casesRef = collection(db, 'cases');
      const q = query(
        casesRef,
        where('date', '==', today),
        where('priority', '==', priority)
      );
      const snapshot = await getDocs(q);

      const cases = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      return {
        priority,
        totalCases: cases.length,
        cases: cases.map((c: any) => ({
          theatre: c.theatre,
          scheduledTime: c.scheduledTime,
          procedureName: c.procedureName,
          status: c.status
        }))
      };
    } catch (error) {
      return { error: `Unable to retrieve ${priority} cases`, details: String(error) };
    }
  }
}
