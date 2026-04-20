import React from 'react'
import { View, Text } from 'react-native'

interface IconsProps {
    color?: string
    size?: number
}

export function HomeIcon({ color = '#000', size = 24 }: IconsProps) {
    return <Text style={{ fontSize: size }}>🏠</Text>
}

export function ClockIcon({ color = '#000', size = 24 }: IconsProps) {
    return <Text style={{ fontSize: size }}>🕐</Text>
}

export function SearchIcon({ color = '#000', size = 24 }: IconsProps) {
    return <Text style={{ fontSize: size }}>🔍</Text>
}