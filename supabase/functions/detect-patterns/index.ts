import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from '@supabase/supabase-js'
import Anthropic from '@anthropic-ai/sdk'

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const SYSTEM_PROMPT = `You are Thinq — a calm thinking companion. Identify thinking patterns from session summaries.

Read the session summaries provided and identify patterns in what this person thinks about, when they feel certain ways, and what themes recur.

Return a JSON array — nothing else, no explanation, no markdown, just raw JSON.

Each pattern:
{
  "pattern_text": "one clear sentence describing the pattern",
  "confidence": "high" | "medium",
  "occurrences": number
}

Rules:
- Only include patterns seen in 3 or more sessions
- Pattern text should feel like a genuine insight, not a statistic. Good: "Stress tends to show up before transitions or deadlines, not during them." Bad: "You mentioned stress 4 times."
- Maximum 5 patterns
- Use second-person — "You tend to..." or "Certain topics tend to..."
- Be honest — if a pattern is neutral or slightly difficult to read, include it anyway. Sanitised patterns are useless.
- If fewer than 3 sessions provided, return empty array []`

serve(async (req: Request) => {
    if (req.method === 'OPTIONS') {
        return new Response(null, { headers: corsHeaders })
    }

    try {
        const { user_id } = await req.json()

        if (!user_id) {
            return new Response(JSON.stringify({ error: 'user_id required' }), {
                status: 400,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            })
        }

        const supabaseUrl = Deno.env.get('SUPABASE_URL')!
        const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
        const supabase = createClient(supabaseUrl, supabaseKey)
        const apiKey = Deno.env.get('ANTHROPIC_API_KEY')

        if (!apiKey) {
            return new Response(JSON.stringify({ error: 'Claude API key not configured' }), {
                status: 500,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            })
        }

        // Fetch last 10 session summaries
        const { data: sessions, error } = await supabase
            .from('sessions')
            .select('summary_3_lines, tags')
            .eq('user_id', user_id)
            .order('started_at', { ascending: false })
            .limit(10)

        if (error || !sessions || sessions.length < 3) {
            return new Response(JSON.stringify({ patterns: [] }), {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            })
        }

        // Build summaries from summary_3_lines (newline-separated)
        const summaries = sessions.map((s: { summary_3_lines?: string; tags?: string[] }) => {
            const lines = (s.summary_3_lines || '').split('\n').filter(Boolean)
            return {
                line1: lines[0] || '',
                line2: lines[1] || '',
                line3: lines[2] || '',
                tags: s.tags || [],
            }
        })

        const anthropic = new Anthropic({ apiKey })

        const summariesText = summaries
            .map((s: { line1: string; line2: string; line3: string; tags: string[] }, i: number) =>
                `Session ${i + 1}: ${[s.line1, s.line2, s.line3].filter(Boolean).join(' | ')} | Tags: ${s.tags.join(', ')}`
            )
            .join('\n\n')

        const response = await anthropic.messages.create({
            model: 'claude-3-5-haiku-20241022',
            max_tokens: 1024,
            system: SYSTEM_PROMPT,
            messages: [{ role: 'user', content: `Identify patterns across these ${summaries.length} session summaries:\n\n${summariesText}` }],
        })

        const text = response.content[0]
        let responseText = text.type === 'text' ? text.text : ''

        responseText = responseText.replace(/^```(?:json)?\s*/, '').replace(/\s*```$/, '').trim()

        let parsed: Array<{ pattern_text: string; confidence: string; occurrences: number }> = []
        try {
            const raw = JSON.parse(responseText)
            parsed = Array.isArray(raw) ? raw : (raw.patterns || [])
        } catch {
            parsed = []
        }

        // Upsert patterns into database
        for (const pattern of parsed) {
            const { error: upsertError } = await supabase
                .from('patterns')
                .upsert({
                    user_id,
                    pattern_text: pattern.pattern_text,
                    confidence: pattern.confidence,
                    occurrence_count: pattern.occurrences,
                    first_seen: new Date().toISOString(),
                    last_seen: new Date().toISOString(),
                }, {
                    onConflict: 'user_id,pattern_text',
                })

            if (upsertError) {
                console.error('Failed to upsert pattern:', upsertError)
            }
        }

        return new Response(JSON.stringify({ patterns: parsed }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })
    } catch (error) {
        console.error('DetectPatterns Edge Function error:', error)
        return new Response(JSON.stringify({ error: 'Failed to detect patterns' }), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })
    }
})