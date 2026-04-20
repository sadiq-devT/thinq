export interface Message {
    id?: string
    role: 'user' | 'assistant'
    content: string
    created_at?: string
}

export interface Session {
    id: string
    user_id: string
    started_at: string
    ended_at: string
    duration_minutes: number
    session_type: 'text' | 'voice'
    time_available_minutes: number
    opening_question: string
    full_transcript: Message[]
    summary_3_lines?: string
    tags?: string[]
    created_at: string
    updated_at: string
}

export interface User {
    id: string
    email: string
    created_at: string
}