import { TextStyle, Platform } from 'react-native'

const fontFamily = Platform.select({
    ios: 'System',
    android: 'Roboto',
    default: 'System',
})

export const typography = {
    heading1: {
        fontFamily,
        fontSize: 28,
        fontWeight: '500',
        lineHeight: 36,
        letterSpacing: -0.3,
    } satisfies TextStyle,

    heading2: {
        fontFamily,
        fontSize: 22,
        fontWeight: '500',
        lineHeight: 30,
        letterSpacing: -0.2,
    } satisfies TextStyle,

    body: {
        fontFamily,
        fontSize: 16,
        fontWeight: '400',
        lineHeight: 24,
        letterSpacing: 0,
    } satisfies TextStyle,

    bodySmall: {
        fontFamily,
        fontSize: 14,
        fontWeight: '400',
        lineHeight: 20,
        letterSpacing: 0,
    } satisfies TextStyle,

    caption: {
        fontFamily,
        fontSize: 12,
        fontWeight: '400',
        lineHeight: 16,
        letterSpacing: 0.2,
    } satisfies TextStyle,

    button: {
        fontFamily,
        fontSize: 16,
        fontWeight: '600',
        lineHeight: 22,
        letterSpacing: 0,
    } satisfies TextStyle,

    tabLabel: {
        fontFamily,
        fontSize: 11,
        fontWeight: '500',
        lineHeight: 14,
        letterSpacing: 0.3,
    } satisfies TextStyle,
}

export type TypographyVariant = keyof typeof typography