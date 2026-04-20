import { supabase } from '@/lib/supabase'
import { buildSystemPrompt, buildOpeningPrompt, type AIClientMessage } from './promptService'

const EDGE_FUNCTION_URL = `${process.env.EXPO_PUBLIC_SUPABASE_URL}/functions/v1/chat`

export interface SessionContext {
    timeAvailable: number
    timeElapsed: number
    userName: string | null
    userTopics: string[]
    userMemory: string[]
    messageCount: number
}

export async function getAIResponse(
    sessionContext: SessionContext,
    conversationHistory: AIClientMessage[]
): Promise<string> {
    try {
        const systemPrompt = buildSystemPrompt(sessionContext)

        const response = await fetch(EDGE_FUNCTION_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY}`,
            },
            body: JSON.stringify({
                messages: conversationHistory,
                systemPrompt,
            }),
        })

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}`)
        }

        const data = await response.json()
        return data.response || ''
    } catch (error) {
        console.error('getAIResponse failed:', error)
        return 'Something went quiet. Try sending again.'
    }
}

export async function generateOpeningQuestion(
    timeAvailable: number,
    timeOfDay: string,
    userTopics: string[],
    lastSessionSummary: string | null
): Promise<string> {
    try {
        const systemPrompt = buildOpeningPrompt()
        const userPrompt = `Generate one opening question for a thinking session.

Context:
- Time available: ${timeAvailable} minutes
- Time of day: ${timeOfDay}
- User's topics: ${userTopics.join(', ') || 'not specified'}
- Last session summary: ${lastSessionSummary || 'first session'}

Requirements:
- Under 15 words
- Warm and inviting, not clinical
- Matches the time of day (morning/evening/night)
- Open-ended, encourages reflection
- Never says "let's talk about" or "tell me about"

Write only the question, nothing else.`

        const response = await fetch(EDGE_FUNCTION_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY}`,
            },
            body: JSON.stringify({
                messages: [{ role: 'user', content: userPrompt }],
                systemPrompt,
            }),
        })

        if (!response.ok) throw new Error(`HTTP ${response.status}`)

        const data = await response.json()
        const question = data.response?.trim()
        if (!question) throw new Error('Empty response')

        return question
    } catch (error) {
        console.error('generateOpeningQuestion failed:', error)
        // Fallback questions by time of day
        const fallbacks: Record<string, string[]> = {
            morning: ["What's on your mind before the day begins?"],
            afternoon: ["What would be useful to think through right now?"],
            evening: ["What are you still carrying from today?"],
            night: ["What would help you feel settled before sleep?"],
        }
        const options = fallbacks[timeOfDay] || fallbacks.afternoon
        return options[Math.floor(Math.random() * options.length)]
    }
}