export const colors = {
    light: {
        // Backgrounds
        background: '#FAFAF8',
        surface: '#FFFFFF',
        surfaceElevated: '#FFFFFF',

        // Text
        textPrimary: '#1A1A18',
        textSecondary: '#6B6B67',
        textTertiary: '#9B9B96',
        textInverse: '#FFFFFF',

        // Accent
        accent: '#7C6FCD',
        accentLight: '#EBE9F9',
        accentDark: '#5B52B0',

        // Semantic
        success: '#2D9E6B',
        successLight: '#E8F5EF',
        danger: '#D94F3D',
        dangerLight: '#FBE9E7',

        // Borders & Dividers
        border: 'rgba(0,0,0,0.08)',
        borderFocused: '#7C6FCD',
        divider: 'rgba(0,0,0,0.06)',

        // Interactive
        buttonPrimary: '#1A1A18',
        buttonPrimaryDisabled: '#D5D5D0',
        buttonSecondary: '#F0F0EE',
        buttonSecondaryText: '#1A1A18',

        // Messages
        userBubble: '#1A1A18',
        aiBubble: '#EBE9F9',
        aiBubbleBorder: '#7C6FCD',

        // Shadows (RGBA for platform compatibility)
        shadowColor: 'rgba(0,0,0,0.06)',
    },
    dark: {
        // Backgrounds
        background: '#0F0F0E',
        surface: '#1C1C1A',
        surfaceElevated: '#252523',

        // Text
        textPrimary: '#F5F5F3',
        textSecondary: '#9B9B96',
        textTertiary: '#6B6B67',
        textInverse: '#1A1A18',

        // Accent
        accent: '#9B91E0',
        accentLight: '#2D2A4A',
        accentDark: '#B8AFFF',

        // Semantic
        success: '#3DBF7E',
        successLight: '#1A3D2E',
        danger: '#E8695A',
        dangerLight: '#3D1F1A',

        // Borders & Dividers
        border: 'rgba(255,255,255,0.08)',
        borderFocused: '#9B91E0',
        divider: 'rgba(255,255,255,0.06)',

        // Interactive
        buttonPrimary: '#F5F5F3',
        buttonPrimaryDisabled: '#4A4A47',
        buttonSecondary: '#252523',
        buttonSecondaryText: '#F5F5F3',

        // Messages
        userBubble: '#F5F5F3',
        aiBubble: '#252523',
        aiBubbleBorder: '#9B91E0',

        // Shadows
        shadowColor: 'rgba(0,0,0,0.30)',
    },
}

export type ColorScheme = typeof colors.light
export type Colors = keyof ColorScheme