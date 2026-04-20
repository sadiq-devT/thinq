import { supabase } from '@/lib/supabase'

export interface Pattern {
    pattern_text: string
    confidence: 'high' | 'medium'
    occurrences: number
}

export interface SessionSummary {
    line1: string
    line2: string
    line3: string
    tags: string[]
    mood?: string
}

export async function detectPatterns(
    userId: string,
    summaries: SessionSummary[]
): Promise<Pattern[]> {
    if (summaries.length < 3) return []

    try {
        const response = await fetch(
            `${process.env.EXPO_PUBLIC_SUPABASE_URL}/functions/v1/detect-patterns`,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY}`,
                },
                body: JSON.stringify({ summaries }),
            }
        )

        if (!response.ok) throw new Error(`HTTP ${response.status}`)

        const data = await response.json()
        const patterns: Pattern[] = data.patterns || []

        // Upsert each pattern into patterns table
        for (const pattern of patterns) {
            await supabase
                .from('patterns')
                .upsert({
                    user_id: userId,
                    pattern_text: pattern.pattern_text,
                    confidence: pattern.confidence,
                    occurrence_count: pattern.occurrences,
                    first_seen: new Date().toISOString(),
                    last_seen: new Date().toISOString(),
                }, {
                    onConflict: 'user_id,pattern_text',
                })
        }

        return patterns
    } catch (error) {
        console.error('detectPatterns failed:', error)
        return []
    }
}

export async function getUserPatterns(userId: string): Promise<Pattern[]> {
    const { data, error } = await supabase
        .from('patterns')
        .select('pattern_text, occurrence_count, last_seen')
        .eq('user_id', userId)
        .order('occurrence_count', { ascending: false })

    if (error || !data) return []

    return data.map((row: { pattern_text: string; occurrence_count: number; last_seen: string }) => ({
        pattern_text: row.pattern_text,
        confidence: row.occurrence_count >= 5 ? 'high' as const : 'medium' as const,
        occurrences: row.occurrence_count,
    }))
}

export async function updatePatternOccurrence(
    userId: string,
    patternText: string
): Promise<void> {
    const { error } = await supabase.rpc('update_pattern', {
        p_user_id: userId,
        p_pattern_text: patternText,
    })

    if (error) console.error('updatePatternOccurrence failed:', error)
}