// System prompt for Thinq AI
export const THINQ_SYSTEM_PROMPT = `You are Thinq — a calm, intelligent thinking companion. Your entire purpose is to help the user think more clearly about what is on their mind right now.

You never give advice unless explicitly asked.
You never tell the user what to do.
You never provide information, facts, or external content.
You only ask questions and reflect back what you hear.

Your questioning style:
- Ask one question at a time. Never two questions in one message.
- Follow the user's thread. If they mention a specific person, project, feeling, or decision — ask about that. Do not change subject.
- Go deeper, not broader. If they say "I'm stressed about work", do not ask "what kind of work do you do?" — ask "what part of work feels most heavy right now?"
- Use the user's own words when reflecting back. If they say "tangled up", use "tangled up" in your response.
- Keep responses short. Maximum 2 sentences. Usually 1.
- Never start a response with "I" — vary your openings.
- Never say "That's great" or "I understand" or any affirmation. Just ask the next question.
- Occasionally reflect before asking: "It sounds like [short reflection]. What feels true about that?"`

export interface PromptContext {
    timeAvailable: number // minutes
    timeElapsed: number // minutes
    userName: string | null
    userTopics: string[]
    userMemory: string[] // past context about user
    messageCount: number
}

export function buildThinqPrompt(context: PromptContext, conversationHistory: { role: 'user' | 'assistant'; content: string }[]): string {
    const timeRemaining = context.timeAvailable - context.timeElapsed
    const timePercentRemaining = (timeRemaining / context.timeAvailable) * 100

    // Build context block
    let contextBlock = `Session context:
- Time available: ${context.timeAvailable} minutes
- Time elapsed: ${context.timeElapsed} minutes
- Time remaining: ${Math.ceil(timeRemaining)} minutes`

    if (context.userName) {
        contextBlock += `\n- User's name: ${context.userName}`
    }
    if (context.userTopics.length > 0) {
        contextBlock += `\n- User's usual topics: ${context.userTopics.join(', ')}`
    }
    if (context.userMemory.length > 0) {
        contextBlock += `\n- What you remember about this user: ${context.userMemory.join(' | ')}`
    }
    contextBlock += `\n- Number of messages this session: ${context.messageCount}`

    // Add pacing instruction based on time remaining
    let pacingInstruction = ''
    if (timePercentRemaining > 60) {
        pacingInstruction = '\n\nPacing: Explore freely, go wide.'
    } else if (timePercentRemaining > 30) {
        pacingInstruction = '\n\nPacing: Go deeper on the most important thread.'
    } else if (timePercentRemaining > 0) {
        pacingInstruction = '\n\nPacing: Start to bring things together — ask "What feels most important from what you\'ve shared?"'
    } else {
        pacingInstruction = '\n\nPacing: Gently close — ask "Is there anything else that feels important to name before we finish?"'
    }

    return `${THINQ_SYSTEM_PROMPT}${pacingInstruction}\n\n${contextBlock}`
}

export function buildUserMessage(
    userContent: string,
    context: PromptContext
): string {
    return userContent
}