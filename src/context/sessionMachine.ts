// Session state machine: idle → starting → active → ending → complete

export type SessionStatus = 'idle' | 'starting' | 'active' | 'ending' | 'complete'
export type MessageRole = 'ai' | 'user'
export type InputMode = 'text' | 'voice'

export interface SessionMessage {
    id: string
    role: MessageRole
    content: string
    timestamp: number
}

export interface SessionState {
    status: SessionStatus
    timeAvailableMinutes: number
    timeElapsedSeconds: number
    messages: SessionMessage[]
    sessionId: string | null
    openingQuestion: string
    isAiTyping: boolean
    inputMode: InputMode
}

export type SessionAction =
    | { type: 'START_SESSION'; payload: { timeAvailableMinutes: number; sessionId: string; openingQuestion: string } }
    | { type: 'ADD_MESSAGE'; payload: SessionMessage }
    | { type: 'SET_AI_TYPING'; payload: boolean }
    | { type: 'TICK' }
    | { type: 'END_SESSION' }
    | { type: 'RESET_SESSION' }

export const initialSessionState: SessionState = {
    status: 'idle',
    timeAvailableMinutes: 0,
    timeElapsedSeconds: 0,
    messages: [],
    sessionId: null,
    openingQuestion: '',
    isAiTyping: false,
    inputMode: 'text',
}

export function sessionReducer(state: SessionState, action: SessionAction): SessionState {
    switch (action.type) {
        case 'START_SESSION':
            return {
                ...initialSessionState,
                status: 'active',
                timeAvailableMinutes: action.payload.timeAvailableMinutes,
                sessionId: action.payload.sessionId,
                openingQuestion: action.payload.openingQuestion,
            }

        case 'ADD_MESSAGE':
            return {
                ...state,
                messages: [...state.messages, action.payload],
            }

        case 'SET_AI_TYPING':
            return { ...state, isAiTyping: action.payload }

        case 'TICK': {
            const newElapsed = state.timeElapsedSeconds + 1
            const maxSeconds = state.timeAvailableMinutes * 60
            if (newElapsed >= maxSeconds) {
                return { ...state, timeElapsedSeconds: maxSeconds, status: 'ending' }
            }
            return { ...state, timeElapsedSeconds: newElapsed }
        }

        case 'END_SESSION':
            return { ...state, status: 'ending' }

        case 'RESET_SESSION':
            return initialSessionState

        default:
            return state
    }
}

// Computed values
export function getTimeRemaining(state: SessionState): number {
    const total = state.timeAvailableMinutes * 60
    return Math.max(total - state.timeElapsedSeconds, 0)
}

export function getProgress(state: SessionState): number {
    const total = state.timeAvailableMinutes * 60
    if (total === 0) return 0
    return Math.min(state.timeElapsedSeconds / total, 1)
}

export function getProgressPercent(state: SessionState): number {
    return Math.round(getProgress(state) * 100)
}

export function formatTimeRemaining(state: SessionState): string {
    const seconds = getTimeRemaining(state)
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
}