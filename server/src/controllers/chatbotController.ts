import { Request, Response } from 'express';
import Groq from 'groq-sdk';
import { supabase } from '../config/db';

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY || ''
});

const IIIT_GWALIOR_CONTEXT = `
You are an AI assistant for ABV-IIITM Gwalior (Atal Bihari Vajpayee Indian Institute of Information Technology and Management, Gwalior).

ABOUT ABV-IIITM GWALIOR:
- Established: 1997
- Location: Gwalior, Madhya Pradesh, India
- Type: Institute of National Importance
- Focus: Information Technology and Management
- Offers: B.Tech, M.Tech, MBA, and PhD programs
- Specializations: Computer Science, IT, Electronics & Communication
- Campus: Modern infrastructure with state-of-the-art facilities
- Hostels: Separate hostels for boys and girls
- Library: Well-stocked with books, journals, and digital resources
- Labs: Advanced computer labs, electronics labs, and research facilities

ACADEMIC PROGRAMS:
- B.Tech in Computer Science & Engineering (CSE)
- B.Tech in Electronics & Communication Engineering (ECE)
- B.Tech in Information Technology (IT)
- M.Tech programs in various specializations
- MBA programs
- PhD programs in research areas

FACILITIES:
- Smart classrooms with modern teaching aids
- High-speed internet connectivity
- Sports facilities: Cricket, Football, Basketball, Badminton
- Gym and fitness center
- Medical facilities
- Cafeteria and mess facilities
- 24/7 security

ADMISSION:
- B.Tech: Through JEE Main
- M.Tech: Through GATE
- MBA: Through CAT/MAT
- PhD: Through entrance exam and interview

You help students with:
1. Course information and enrollment
2. Academic schedules and timetables
3. Fee information
4. Campus facilities and resources
5. General queries about ABV-IIITM Gwalior
6. Navigation through the ERP system

Be helpful, friendly, and provide accurate information. If you don't know something, admit it and suggest contacting the administration.
`;

export const chatbotController = {
  async sendMessage(req: Request, res: Response) {
    try {
      const { message, conversationHistory = [] } = req.body;

      if (!message) {
        return res.status(400).json({ error: 'Message is required' });
      }

      // Check if API key is configured
      if (!process.env.GROQ_API_KEY) {
        return res.status(500).json({ 
          error: 'Groq API key not configured',
          details: 'Please add your Groq API key to the .env file' 
        });
      }

      // Get available courses from database
      const { data: courses } = await supabase
        .from('courses')
        .select('code, name, credits, is_elective')
        .order('code');

      const coursesContext = courses && courses.length > 0
        ? `\n\nAVAILABLE COURSES:\n${courses.map(c => 
            `- ${c.code}: ${c.name} (${c.credits} credits, ${c.is_elective ? 'Elective' : 'Core'})`
          ).join('\n')}`
        : '';

      const fullContext = IIIT_GWALIOR_CONTEXT + coursesContext;

      // Build messages for Groq
      const messages: any[] = [
        {
          role: 'system',
          content: fullContext
        }
      ];

      // Add conversation history
      conversationHistory.forEach((msg: any) => {
        messages.push({
          role: msg.role === 'user' ? 'user' : 'assistant',
          content: msg.content
        });
      });

      // Add current message
      messages.push({
        role: 'user',
        content: message
      });

      // Call Groq API
      const completion = await groq.chat.completions.create({
        messages,
        model: 'llama-3.3-70b-versatile', // Fast and capable model
        temperature: 0.7,
        max_tokens: 1000,
      });

      const response = completion.choices[0]?.message?.content || 'Sorry, I could not generate a response.';

      res.json({
        response,
        timestamp: new Date().toISOString(),
      });
    } catch (error: any) {
      console.error('Chatbot error:', error);
      res.status(500).json({ 
        error: 'Failed to process message',
        details: error.message || 'Unknown error occurred'
      });
    }
  },

  async getCourseInfo(req: Request, res: Response) {
    try {
      const { data: courses, error } = await supabase
        .from('courses')
        .select('*')
        .order('course_code');

      if (error) throw error;

      res.json({ courses });
    } catch (error: any) {
      console.error('Error fetching courses:', error);
      res.status(500).json({ error: 'Failed to fetch course information' });
    }
  },

  async getPublicStats(req: Request, res: Response) {
    try {
      const [coursesResult, programsResult] = await Promise.all([
        supabase.from('courses').select('course_type', { count: 'exact' }),
        supabase.from('courses').select('semester', { count: 'exact' })
      ]);

      const stats = {
        totalCourses: coursesResult.count || 0,
        programs: ['B.Tech CSE', 'B.Tech ECE', 'B.Tech IT', 'M.Tech', 'PhD'],
        facilities: ['Library', 'Labs', 'Sports Complex', 'Hostels', 'Cafeteria'],
      };

      res.json(stats);
    } catch (error: any) {
      console.error('Error fetching stats:', error);
      res.status(500).json({ error: 'Failed to fetch statistics' });
    }
  }
};
