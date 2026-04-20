import type { Message } from '@/types'

export type TimeOfDay = 'morning' | 'afternoon' | 'evening' | 'night'

interface SummaryResult {
    line1: string
    line2: string
    line3: string
    tags: string[]
}

const MOCK_RESPONSES: Record<number, string> = {
    1: "That makes sense. What feels most heavy about that right now?",
    2: "When you say that, what do you think is underneath it?",
    3: "It sounds like there might be something you've been avoiding. Does that feel right?",
}

export function getOpeningQuestion(
    timeAvailable: number,
    timeOfDay: TimeOfDay,
    userTopics: string[]
): string {
    if (timeOfDay === 'morning' && userTopics.includes('work')) {
        return "What's on your mind before the day begins?"
    }
    if (timeOfDay === 'evening') {
        return "What are you still carrying from today?"
    }
    if (timeOfDay === 'night') {
        return "What would help you feel settled before sleep?"
    }
    if (timeAvailable <= 5) {
        return "What's the one thing taking up the most space right now?"
    }
    return "What would be most useful to think through today?"
}

export async function getMockResponse(
    userMessage: string,
    messageCount: number
): Promise<string> {
    await delay(1200)

    const response = MOCK_RESPONSES[messageCount]
    if (response) return response

    return "What would feel like a small step forward with this?"
}

export function getMockSummary(messages: Message[]): SummaryResult {
    const userMessages = messages.filter((m) => m.role === 'user')

    if (userMessages.length >= 3) {
        return {
            line1: "You explored feelings about work pressure and decisions you've been postponing.",
            line2: "Something important: the conversation hinted at a deeper fear of being wrong.",
            line3: "One thread to revisit: the upcoming conversation with your manager next week.",
            tags: ['work', 'decisions', 'career'],
        }
    }

    if (userMessages.length >= 2) {
        return {
            line1: "You talked through something that has been weighing on you lately.",
            line2: "A key moment: you admitted the real issue isn't the situation itself, but how you're viewing it.",
            line3: "One thing to think about before your next session.",
            tags: ['reflections'],
        }
    }

    return {
        line1: "You shared what's on your mind to start the session.",
        line2: "The conversation was just getting started when time ran out.",
        line3: "Continue where you left off next time.",
        tags: ['getting-started'],
    }
}

function delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms))
}

export function getTimeOfDay(): TimeOfDay {
    const hour = new Date().getHours()
    if (hour >= 5 && hour < 12) return 'morning'
    if (hour >= 12 && hour < 17) return 'afternoon'
    if (hour >= 17 && hour < 21) return 'evening'
    return 'night'
}