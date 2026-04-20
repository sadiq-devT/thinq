import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import Anthropic from '@anthropic-ai/sdk'

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req: Request) => {
    // Handle CORS preflight
    if (req.method === 'OPTIONS') {
        return new Response(null, { headers: corsHeaders })
    }

    try {
        const { messages, systemPrompt } = await req.json()

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

        const response = await anthropic.messages.create({
            model: 'claude-3-5-haiku-20241022',
            max_tokens: 1024,
            system: systemPrompt || '',
            messages: messages.map((m: { role: string; content: string }) => ({
                role: m.role === 'assistant' ? 'assistant' : 'user',
                content: m.content,
            })),
        })

        const text = response.content[0]
        const responseText = text.type === 'text' ? text.text : ''

        return new Response(JSON.stringify({ response: responseText }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })
    } catch (error) {
        console.error('Claude Edge Function error:', error)
        return new Response(JSON.stringify({ error: 'Failed to get AI response' }), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })
    }
})