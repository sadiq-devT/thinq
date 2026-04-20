import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import Anthropic from '@anthropic-ai/sdk'

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const SYSTEM_PROMPT = `You are Thinq — a calm thinking companion. Extract persistent memory facts from a thinking session.

Read the full conversation and return a JSON array — nothing else, no explanation, no markdown, just raw JSON.

Each item in the array:
{ "key": "short_snake_case_key", "value": "the fact as a short sentence" }

What to extract:
- Named people in their life (e.g. "manager_name": "Their manager is called Sarah")
- Named projects or work context (e.g. "current_project": "Working on a product launch called Project X")
- Ongoing concerns (e.g. "recurring_stress": "Frequently feels behind on deadlines")
- Personal values revealed (e.g. "core_value": "Cares deeply about doing things properly")
- Named decisions they are facing (e.g. "open_decision": "Considering whether to change jobs")
- Relationships they mentioned (e.g. "partner_name": "Partner is called Mia")

Rules:
- Maximum 5 items per session
- Only extract things that are likely to remain true for weeks or months
- Do not extract moods or one-day feelings
- Use concise factual statements
- If nothing memorable was revealed, return an empty array []`

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
            messages: [{ role: 'user', content: `Extract memory facts from this session:\n\n${conversationText}` }],
        })

        const text = response.content[0]
        let responseText = text.type === 'text' ? text.text : ''

        // Strip markdown code blocks
        responseText = responseText.replace(/^```(?:json)?\s*/, '').replace(/\s*```$/, '').trim()

        let parsed: Array<{ key: string; value: string }> = []
        try {
            parsed = JSON.parse(responseText)
            if (!Array.isArray(parsed)) parsed = []
        } catch {
            parsed = []
        }

        return new Response(JSON.stringify({ memories: parsed }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })
    } catch (error) {
        console.error('ExtractMemory Edge Function error:', error)
        return new Response(JSON.stringify({ error: 'Failed to extract memories' }), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })
    }
})