import { useState } from 'react'
import { View, Text, TextInput, FlatList, StyleSheet } from 'react-native'
import { useRouter } from 'expo-router'
import { searchSessions } from '@/services/supabase'
import type { Session } from '@/types'

export default function SearchScreen() {
    const router = useRouter()
    const [query, setQuery] = useState('')
    const [results, setResults] = useState<Session[]>([])
    const [isSearching, setIsSearching] = useState(false)

    const handleSearch = async (text: string) => {
        setQuery(text)
        if (text.length < 2) {
            setResults([])
            return
        }
        setIsSearching(true)
        try {
            const data = await searchSessions(text)
            setResults(data)
        } finally {
            setIsSearching(false)
        }
    }

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>Search</Text>
                <TextInput
                    style={styles.input}
                    placeholder="Search your thoughts..."
                    placeholderTextColor="#A0A0A0"
                    value={query}
                    onChangeText={handleSearch}
                    autoCorrect={false}
                />
            </View>

            <FlatList
                data={results}
                keyExtractor={(item) => item.id}
                contentContainerStyle={styles.list}
                renderItem={({ item }) => (
                    <Text
                        style={styles.resultItem}
                        onPress={() => router.push(`/session/${item.id}`)}
                    >
                        {item.full_transcript?.[0]?.content}
                    </Text>
                )}
                ListEmptyComponent={
                    <Text style={styles.empty}>
                        {query.length >= 2 ? 'No results found' : 'Type to search'}
                    </Text>
                }
            />
        </View>
    )
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#FAFAFA' },
    header: { paddingTop: 80, paddingHorizontal: 24, paddingBottom: 16 },
    title: { fontSize: 28, fontWeight: '600', color: '#1A1A1A', marginBottom: 20 },
    input: { backgroundColor: '#FFFFFF', borderRadius: 12, padding: 16, fontSize: 16, color: '#1A1A1A' },
    list: { paddingHorizontal: 24, paddingTop: 16 },
    resultItem: { fontSize: 15, color: '#1A1A1A', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#F0F0F0' },
    empty: { fontSize: 14, color: '#A0A0A0', textAlign: 'center', marginTop: 40 },
})