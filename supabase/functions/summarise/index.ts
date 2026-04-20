import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import Anthropic from '@anthropic-ai/sdk'

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const SYSTEM_PROMPT = `You are Thinq — a calm thinking companion. You are summarising a thinking session.

Read the full conversation and return a JSON object — nothing else, no explanation, no markdown, just raw JSON.

The JSON must have exactly this shape:
{
  "line1": "one sentence: what the user mainly talked about",
  "line2": "one sentence: the most important thing that came up — an insight, a tension, or something they named that felt significant",
  "line3": "one sentence: a thread to notice or revisit — something unresolved or worth returning to",
  "tags": ["tag1", "tag2", "tag3"],
  "oneWordMood": "one word describing the emotional tone of this session"
}

Rules:
- Each line is maximum 20 words
- Tags are 1-2 words each, lowercase, maximum 3 tags
- Use the user's own language where possible
- line2 should feel like a small insight, not just a description
- Never start line2 with "You said" — make it a clean observation
- oneWordMood examples: heavy, clear, tangled, hopeful, anxious, unresolved, grounded`

serve(async (req: Request) => {
    if (req.method === 'OPTIONS') {
        return new Response(null, { headers: corsHeaders })
    }

    try {
        const { messages } = await req.json()

        if (!messages || !Array.isArray(messages)) {
            return new Response(JSON.stringify({ error: 'Invalid messages' }), {
                status: 400,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            })
        }

        const apiKey = Deno.env.get('ANTHROPIC_API_KEY')
        if (!apiKey) {
            return new Response(JSON.stringify({ error: 'Claude API key not configured' }), {
                status: 500,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            })
        }

        const anthropic = new Anthropic({ apiKey })

        const conversationText = messages
            .map((m: { role: string; content: string }) => `${m.role}: ${m.content}`)
            .join('\n')

        const response = await anthropic.messages.create({
            model: 'claude-3-5-haiku-20241022',
            max_tokens: 512,
            system: SYSTEM_PROMPT,
            messages: [{ role: 'user', content: `Summarise this session:\n\n${conversationText}` }],
        })

        const text = response.content[0]
        let responseText = text.type === 'text' ? text.text : ''

        // Try to parse as JSON and validate structure
        try {
            // Strip any markdown code blocks if present
            responseText = responseText.replace(/^```json\s*/, '').replace(/\s*```$/, '').trim()
            const parsed = JSON.parse(responseText)

            // Validate required fields
            if (!parsed.line1 || !parsed.line2 || !parsed.line3 || !Array.isArray(parsed.tags) || !parsed.oneWordMood) {
                throw new Error('Missing required fields')
            }

            return new Response(JSON.stringify(parsed), {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            })
        } catch (parseError) {
            // If parsing fails, return a fallback summary
            const fallback = {
                line1: 'A thinking session about what was on your mind.',
                line2: 'Something worth reflecting on emerged during the conversation.',
                line3: 'A thread to revisit in your next session.',
                tags: ['reflection'],
                oneWordMood: 'thoughtful',
            }
            return new Response(JSON.stringify(fallback), {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            })
        }
    } catch (error) {
        console.error('Summarise Edge Function error:', error)
        return new Response(JSON.stringify({ error: 'Failed to summarise session' }), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })
    }
})