import React, { createContext, useContext, useEffect, useState, useRef } from 'react'
import NetInfo from '@react-native-community/netinfo'

interface NetworkContextValue {
    isConnected: boolean
    isInternetReachable: boolean | null
    offlineQuestionIndex: number
    incrementOfflineIndex: () => void
}

const NetworkContext = createContext<NetworkContextValue>({
    isConnected: true,
    isInternetReachable: true,
    offlineQuestionIndex: 0,
    incrementOfflineIndex: () => { },
})

export function NetworkProvider({ children }: { children: React.ReactNode }) {
    const [isConnected, setIsConnected] = useState(true)
    const [isInternetReachable, setIsInternetReachable] = useState<boolean | null>(true)
    const [offlineQuestionIndex, setOfflineQuestionIndex] = useState(0)

    useEffect(() => {
        // Get initial state
        NetInfo.fetch().then((state) => {
            setIsConnected(state.isConnected ?? false)
            setIsInternetReachable(state.isInternetReachable)
        })

        // Subscribe to changes
        const unsubscribe = NetInfo.addEventListener((state) => {
            setIsConnected(state.isConnected ?? false)
            setIsInternetReachable(state.isInternetReachable)
        })

        return () => unsubscribe()
    }, [])

    const incrementOfflineIndex = () => {
        setOfflineQuestionIndex((prev) => prev + 1)
    }

    return (
        <NetworkContext.Provider
            value={{
                isConnected,
                isInternetReachable,
                offlineQuestionIndex,
                incrementOfflineIndex,
            }}
        >
            {children}
        </NetworkContext.Provider>
    )
}

export function useNetwork(): NetworkContextValue {
    return useContext(NetworkContext)
}