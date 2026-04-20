// Offline question bank — pre-written follow-up questions
// Used when no internet connection is available

export const OFFLINE_QUESTIONS: string[] = [
    "What feels most important about that?",
    "What would change if you resolved this?",
    "What are you actually afraid of here?",
    "What would the best version of you do?",
    "What does this remind you of?",
    "What are you telling yourself about this?",
    "What do you need to hear right now?",
    "What would feel like a small win?",
    "What are you not saying out loud?",
    "What would help you feel more settled?",
]

// Get question by index (cycles back to 0 when exhausted)
export function getOfflineQuestion(index: number): string {
    return OFFLINE_QUESTIONS[index % OFFLINE_QUESTIONS.length]
}

// Get a random fallback question
export function getRandomOfflineQuestion(): string {
    const idx = Math.floor(Math.random() * OFFLINE_QUESTIONS.length)
    return OFFLINE_QUESTIONS[idx]
}