import Anthropic from '@anthropic-ai/sdk'
import { buildThinqPrompt, buildUserMessage, type PromptContext } from './promptBuilder'

const anthropic = new Anthropic({
    apiKey: process.env.EXPO_PUBLIC_ANTHROPIC_API_KEY!,
})

const MODEL = 'claude-haiku-4-5-20251001'
const MAX_TOKENS = 1024

export async function sendToClaude(
    messages: { role: 'user' | 'assistant'; content: string }[],
    context: PromptContext
): Promise<string> {
    const systemPrompt = buildThinqPrompt(context, messages.slice(0, -1))
    const lastMessage = messages[messages.length - 1]

    const response = await anthropic.messages.create({
        model: MODEL,
        max_tokens: MAX_TOKENS,
        system: systemPrompt,
        messages: [
            { role: 'user', content: buildUserMessage(lastMessage.content, context) },
        ],
    })

    const text = response.content[0]
    if (text.type === 'text') {
        return text.text
    }
    return ''
}

export async function sendToClaudeWithHistory(
    messages: { role: 'user' | 'assistant'; content: string }[],
    context: PromptContext
): Promise<string> {
    const systemPrompt = buildThinqPrompt(context, messages.slice(0, -1))
    const lastMessage = messages[messages.length - 1]

    const response = await anthropic.messages.create({
        model: MODEL,
        max_tokens: MAX_TOKENS,
        system: systemPrompt,
        messages: messages.slice(0, -1).concat([
            { role: 'user' as const, content: buildUserMessage(lastMessage.content, context) },
        ]),
    })

    const text = response.content[0]
    if (text.type === 'text') {
        return text.text
    }
    return ''
}