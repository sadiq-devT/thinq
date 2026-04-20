import { useState, useEffect } from 'react'
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native'
import { useRouter } from 'expo-router'
import { useSessions } from '@/hooks/useSessions'
import type { Session } from '@/types'

export default function HistoryScreen() {
    const router = useRouter()
    const { sessions, loading: isLoading } = useSessions()
    const [groupedSessions, setGroupedSessions] = useState<{ date: string; items: Session[] }[]>([])

    useEffect(() => {
        const groups: Record<string, Session[]> = {}
        sessions.forEach((session) => {
            const date = new Date(session.created_at).toLocaleDateString('en-US', {
                weekday: 'long',
                month: 'short',
                day: 'numeric',
            })
            if (!groups[date]) groups[date] = []
            groups[date].push(session)
        })
        setGroupedSessions(
            Object.entries(groups).map(([date, items]) => ({ date, items }))
        )
    }, [sessions])

    const renderSession = ({ item }: { item: Session }) => (
        <TouchableOpacity
            style={styles.sessionCard}
            onPress={() => router.push(`/session/${item.id}`)}
        >
            <View style={styles.sessionHeader}>
                <Text style={styles.sessionTime}>
                    {new Date(item.created_at).toLocaleTimeString('en-US', {
                        hour: 'numeric',
                        minute: '2-digit',
                    })}
                </Text>
                <Text style={styles.sessionDuration}>{item.duration_minutes} min</Text>
            </View>
            <Text style={styles.sessionPreview} numberOfLines={2}>
                {item.full_transcript?.[0]?.content || 'Empty session'}
            </Text>
        </TouchableOpacity>
    )

    const renderGroup = ({ item }: { item: { date: string; items: Session[] } }) => (
        <View style={styles.group}>
            <Text style={styles.groupDate}>{item.date}</Text>
            <FlatList
                data={item.items}
                renderItem={renderSession}
                keyExtractor={(s) => s.id}
                scrollEnabled={false}
            />
        </View>
    )

    return (
        <View style={styles.container}>
            <Text style={styles.title}>History</Text>
            <FlatList
                data={groupedSessions}
                renderItem={renderGroup}
                keyExtractor={(g) => g.date}
                contentContainerStyle={styles.list}
                refreshing={isLoading}
            />
        </View>
    )
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#FAFAFA' },
    title: { fontSize: 28, fontWeight: '600', color: '#1A1A1A', paddingTop: 80, paddingHorizontal: 24, paddingBottom: 24 },
    list: { paddingHorizontal: 24, paddingBottom: 40 },
    group: { marginBottom: 24 },
    groupDate: { fontSize: 13, fontWeight: '600', color: '#A0A0A0', textTransform: 'uppercase', marginBottom: 12 },
    sessionCard: { backgroundColor: '#FFFFFF', borderRadius: 12, padding: 16, marginBottom: 8 },
    sessionHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
    sessionTime: { fontSize: 15, fontWeight: '600', color: '#1A1A1A' },
    sessionDuration: { fontSize: 13, color: '#A0A0A0' },
    sessionPreview: { fontSize: 14, color: '#666666', lineHeight: 20 },
})