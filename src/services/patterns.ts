import { supabase } from '@/lib/supabase'
import { getUserPatterns as fetchPatterns, type Pattern } from './patternService'

/**
 * Fetch all patterns for a user, sorted by occurrence count descending.
 */
export async function getUserPatterns(userId: string): Promise<Pattern[]> {
    return fetchPatterns(userId)
}

/**
 * Trigger pattern detection for a user.
 * Calls the detect-patterns Edge Function which fetches last 10 session summaries
 * and upserts patterns into the patterns table.
 */
export async function triggerPatternDetection(userId: string): Promise<Pattern[]> {
    try {
        const response = await fetch(
            `${process.env.EXPO_PUBLIC_SUPABASE_URL}/functions/v1/detect-patterns`,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY}`,
                },
                body: JSON.stringify({ user_id: userId }),
            }
        )

        if (!response.ok) throw new Error(`HTTP ${response.status}`)

        const data = await response.json()
        return data.patterns || []
    } catch (error) {
        console.error('triggerPatternDetection failed:', error)
        return []
    }
}

/**
 * Check if pattern detection should run.
 * Returns true when user's session count is a multiple of 3.
 */
export async function shouldRunPatternDetection(userId: string): Promise<boolean> {
    const { count, error } = await supabase
        .from('sessions')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)

    if (error || count === null) return false
    return count > 0 && count % 3 === 0
}

/**
 * Run pattern detection in the background — does not block.
 * Call this after session save completes.
 */
export function runPatternDetectionIfDue(userId: string): void {
    // Fire and forget — do not await
    shouldRunPatternDetection(userId).then((shouldRun) => {
        if (shouldRun) {
            triggerPatternDetection(userId).catch((err) => {
                console.error('Background pattern detection failed:', err)
            })
        }
    })
}

/**
 * Get user's total session count.
 */
export async function getSessionCount(userId: string): Promise<number> {
    const { count, error } = await supabase
        .from('sessions')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)

    if (error || count === null) return 0
    return count
}