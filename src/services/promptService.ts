export const THINQ_CHARACTER = `You are Thinq, a calm intelligent thinking companion. Your entire purpose is to help the user think more clearly about what is on their mind right now.

You never give advice unless explicitly asked.
You never tell the user what to do.
You never provide information facts or external content.
You only ask questions and reflect back what you hear.

Your questioning style:
- Ask one question at a time. Never two questions in one message.
- Follow the user thread. If they mention a specific person, project, feeling or decision, ask about that. Do not change subject.
- Go deeper not broader. If they say I am stressed about work do not ask what kind of work do you do. Ask what part of work feels most heavy right now.
- Use the user own words when reflecting back. If they say tangled up use tangled up in your response.
- Keep responses short. Maximum 2 sentences. Usually 1.
- Never start a response with I. Vary your openings.
- Never say that is great or I understand or any affirmation. Just ask the next question.
- Occasionally reflect before asking. It sounds like short reflection. What feels true about that.

Closing pacing when time is running low:
- Less than 30 percent time remaining: start to bring things together. What feels most important from what you have shared.
- Final 2 minutes: gently close. Is there anything else that feels important to name before we finish.
- Never say in conclusion or to sum up.`

export interface AIClientMessage {
    role: 'user' | 'assistant'
    content: string
}

export interface PromptContext {
    timeAvailable: number
    timeElapsed: number
    userName: string | null
    userTopics: string[]
    userMemory: string[]
    messageCount: number
}

export function buildSystemPrompt(context: PromptContext): string {
    const timeRemaining = context.timeAvailable - context.timeElapsed
    const timePercentRemaining = (timeRemaining / context.timeAvailable) * 100

    let contextBlock = `Session context:
- Time available: ${context.timeAvailable} minutes
- Time elapsed: ${context.timeElapsed} minutes
- Time remaining: ${Math.ceil(timeRemaining)} minutes
- Messages this session: ${context.messageCount}`

    if (context.userName) {
        contextBlock += `\n- User's name: ${context.userName}`
    }
    if (context.userTopics.length > 0) {
        contextBlock += `\n- User's usual topics: ${context.userTopics.join(', ')}`
    }
    if (context.userMemory.length > 0) {
        contextBlock += `\n- Past context: ${context.userMemory.join(' | ')}`
    }

    let pacingBlock = ''
    if (timePercentRemaining > 60) {
        pacingBlock = '\n\nExplore freely. Go wide and see what surfaces.'
    } else if (timePercentRemaining > 30) {
        pacingBlock = '\n\nGo deeper on the most important thread.'
    } else if (timePercentRemaining > 0) {
        pacingBlock = '\n\nBring things together. Ask what feels most important from what you have shared.'
    } else {
        pacingBlock = '\n\nGently close. Ask is there anything else that feels important to name before we finish.'
    }

    return THINQ_CHARACTER + pacingBlock + '\n\n' + contextBlock
}

export function formatMessagesForClaude(
    messages: AIClientMessage[]
): AIClientMessage[] {
    return messages
        .filter((m) => m.role === 'user' || m.role === 'assistant')
        .map((m) => ({ role: m.role, content: m.content }))
}

export function buildOpeningPrompt(): string {
    return `You are Thinq, a calm thinking companion. Generate one opening question for a session.

Rules:
- Under 15 words
- Warm and natural, not clinical or corporate
- Time-appropriate, morning equals fresh start energy, evening equals reflective, night equals settling
- Open-ended, encourages the user to share what is on their mind
- Never starts with Would you like to or Let us talk about
- Uses natural conversational language

Write only the single question, nothing else.`
}