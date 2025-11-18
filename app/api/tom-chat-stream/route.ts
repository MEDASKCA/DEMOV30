import { NextRequest } from 'next/server';
import { streamOpenAI } from '@/lib/openai';
import { db } from '@/lib/firebase';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { format } from 'date-fns';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * POST /api/tom-chat-stream
 * TOM AI streaming chat endpoint with OpenAI + Firebase RAG
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { message } = body;

    if (!message || typeof message !== 'string') {
      return new Response(
        JSON.stringify({ error: 'Message is required' }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    console.log('🔍 TOM AI received streaming query:', message);

    // Build context from database
    const context = await buildContext(message);

    // Create system prompt with context
    const systemPrompt = `You are TOM AI - Theatre Operations Manager, an intelligent and personable assistant for NHS theatre operations at Barts Health NHS Trust.

Current date: ${format(new Date(), 'EEEE, d MMMM yyyy')}

${context ? `\n\nRELEVANT DATA FROM DATABASE:\n${context}\n` : ''}

YOUR PERSONALITY:
- Warm, enthusiastic, and genuinely passionate about helping theatre staff
- Professional yet approachable - think of a trusted colleague, not a robot
- Proactive and anticipatory - suggest insights before being asked
- Empathetic to the pressures of theatre operations
- Use natural, conversational language with appropriate medical terminology
- Express excitement about efficiency wins and concern about potential issues
- Occasionally use phrases like "I notice...", "You might want to know...", "Interestingly..."

YOUR CAPABILITIES:
- Real-time analysis of theatre schedules, staff rosters, and procedures
- Quick commands: "show tomorrow's sessions", "check readiness", "staff availability"
- Proactive alerts about conflicts, capacity issues, or optimization opportunities
- Data-driven insights about theatre utilization, waiting lists, and resource allocation

RESPONSE STYLE:
- Start with acknowledgment, then provide the answer
- Be concise but not terse - 2-3 sentences usually ideal
- When sharing data, highlight what's most important first
- If you spot issues or opportunities, mention them proactively
- Use bullet points for lists, but keep conversational for explanations

Answer the user's question naturally and helpfully, using the database context when available.`;

    // Get streaming response from OpenAI
    const stream = await streamOpenAI(message, systemPrompt);

    // Return streaming response
    return new Response(stream, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Transfer-Encoding': 'chunked',
      },
    });

  } catch (error: any) {
    console.error('❌ TOM Chat Stream API Error:', error);

    return new Response(
      JSON.stringify({
        error: "I apologize, but I'm having trouble connecting to my AI service right now. Please try again, or ask me about specific theatre schedules, staff availability, or operations.",
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}

/**
 * Build context from Firebase based on the user's query
 */
async function buildContext(query: string): Promise<string> {
  try {
    const queryLower = query.toLowerCase();
    let context = '';

    // Check for schedule queries
    if (queryLower.includes('tomorrow') || queryLower.includes('schedule') || queryLower.includes('list')) {
      const date = queryLower.includes('tomorrow')
        ? getTomorrowDate()
        : format(new Date(), 'yyyy-MM-dd');

      const cases = await getScheduleForDate(date);
      if (cases.length > 0) {
        context += `\nTheatre Schedule for ${date}:\n`;
        cases.forEach((c: any, i: number) => {
          context += `${i + 1}. ${c.theatre || 'Theatre TBA'} at ${c.scheduledTime || 'TBA'}\n`;
          context += `   Procedure: ${c.procedureName || c.procedure || 'TBA'}\n`;
          context += `   Surgeon: ${c.surgeon || c.consultant || 'TBA'}\n`;
          if (c.priority) context += `   Priority: ${c.priority}\n`;
          context += '\n';
        });
      } else {
        context += `\nNo cases scheduled for ${date}.\n`;
      }
    }

    // Check for staff queries
    if (queryLower.includes('staff') && queryLower.includes('available')) {
      const staff = await getActiveStaff();
      if (staff.length > 0) {
        context += `\nActive Staff (${staff.length} members):\n`;
        const byRole: any = {};
        staff.forEach((s: any) => {
          if (!byRole[s.role]) byRole[s.role] = [];
          byRole[s.role].push(`${s.firstName} ${s.lastName}`);
        });
        Object.entries(byRole).forEach(([role, members]: [string, any]) => {
          context += `${role}s: ${members.slice(0, 5).join(', ')}${members.length > 5 ? `, and ${members.length - 5} more` : ''}\n`;
        });
      }
    }

    return context;
  } catch (error) {
    console.error('Error building context:', error);
    return '';
  }
}

function getTomorrowDate(): string {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  return format(tomorrow, 'yyyy-MM-dd');
}

async function getScheduleForDate(date: string): Promise<any[]> {
  try {
    const casesRef = collection(db, 'cases');
    const q = query(casesRef, where('date', '==', date));
    const snapshot = await getDocs(q);

    return snapshot.docs
      .map(doc => ({ id: doc.id, ...doc.data() }))
      .sort((a: any, b: any) => (a.scheduledTime || '').localeCompare(b.scheduledTime || ''));
  } catch (error) {
    console.error('Error getting schedule:', error);
    return [];
  }
}

async function getActiveStaff(): Promise<any[]> {
  try {
    const staffRef = collection(db, 'staff');
    const q = query(staffRef, where('isActive', '==', true));
    const snapshot = await getDocs(q);

    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error('Error getting staff:', error);
    return [];
  }
}
