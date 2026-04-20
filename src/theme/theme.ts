import { colors, ColorScheme } from './colors'
import { typography } from './typography'

export const spacing = {
    xxs: 4,
    xs: 8,
    sm: 12,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
} as const

export const borderRadius = {
    sm: 8,
    md: 12,
    lg: 16,
    xl: 24,
    full: 9999,
} as const

export const shadows = {
    sm: {
        shadowColor: colors.light.shadowColor,
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 1,
        shadowRadius: 3,
        elevation: 1,
    },
    md: {
        shadowColor: colors.light.shadowColor,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 1,
        shadowRadius: 8,
        elevation: 3,
    },
    lg: {
        shadowColor: colors.light.shadowColor,
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 1,
        shadowRadius: 16,
        elevation: 6,
    },
} as const

export interface Theme {
    colors: ColorScheme
    typography: typeof typography
    spacing: typeof spacing
    borderRadius: typeof borderRadius
    shadows: typeof shadows
}

export const createTheme = (mode: 'light' | 'dark'): Theme => ({
    colors: colors[mode],
    typography,
    spacing,
    borderRadius,
    shadows,
})

export const lightTheme = createTheme('light')
export const darkTheme = createTheme('dark')

export { colors, typography }
export type { ColorScheme } from './colors'
export type { TypographyVariant } from './typography'