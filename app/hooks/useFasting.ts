"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { getFastingLogs, startFast as serverStartFast, endFast as serverEndFast, cancelFast as serverCancelFast } from "../actions/fasting";

export interface FastingEntry {
    id: string;
    startTime: number;
    endTime: number;
    duration: number; // in seconds
}

export interface FastingState {
    isFasting: boolean;
    startTime: number | null;
    history: FastingEntry[];
    goalHours: number;
    currentLogId?: string;
}

const STORAGE_KEY = "fasttrack_data";

export function useFasting() {
    const { data: session } = useSession();
    const user = session?.user;

    const [state, setState] = useState<FastingState>({
        isFasting: false,
        startTime: null,
        history: [],
        goalHours: 16,
    });

    const [isLoaded, setIsLoaded] = useState(false);

    // 1. Load Data
    useEffect(() => {
        async function init() {
            if (user) {
                // Load from Server Actions
                try {
                    const { active, history } = await getFastingLogs();

                    setState(prev => ({
                        ...prev,
                        isFasting: !!active,
                        startTime: active ? new Date(active.startTime).getTime() : null,
                        currentLogId: active?.id,
                        history: history.map(h => ({
                            id: h.id,
                            startTime: new Date(h.startTime).getTime(),
                            endTime: h.endTime ? new Date(h.endTime).getTime() : 0,
                            duration: h.duration || 0
                        }))
                    }));
                } catch (e) { console.error(e) }
            } else {
                // Load from LocalStorage
                const stored = localStorage.getItem(STORAGE_KEY);
                if (stored) {
                    try {
                        setState(JSON.parse(stored));
                    } catch (e) { console.error(e); }
                }
            }
            setIsLoaded(true);
        }
        init();
    }, [user]);

    // 2. Persist to LocalStorage (Backup)
    useEffect(() => {
        if (isLoaded && !user) {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
        }
    }, [state, isLoaded, user]);

    // 3. Actions
    const startFast = async () => {
        if (state.isFasting) return;
        const now = Date.now();

        // Optimistic
        setState((prev) => ({
            ...prev,
            isFasting: true,
            startTime: now,
        }));

        if (user) {
            try {
                const log = await serverStartFast(state.goalHours);
                setState(prev => ({ ...prev, currentLogId: log.id }));
            } catch (e) {
                console.error(e);
            }
        }
    };

    const endFast = async () => {
        if (!state.isFasting || !state.startTime) return;
        const now = Date.now();
        const duration = Math.floor((now - state.startTime) / 1000);

        const newEntry: FastingEntry = {
            id: crypto.randomUUID(),
            startTime: state.startTime,
            endTime: now,
            duration,
        };

        // Optimistic
        setState((prev) => ({
            ...prev,
            isFasting: false,
            startTime: null,
            history: [newEntry, ...prev.history],
            currentLogId: undefined
        }));

        if (user && state.currentLogId) {
            await serverEndFast(state.currentLogId);
        }
    };

    const cancelFast = async () => {
        const oldId = state.currentLogId;
        // Optimistic
        setState((prev) => ({
            ...prev,
            isFasting: false,
            startTime: null,
            currentLogId: undefined
        }));

        if (user && oldId) {
            await serverCancelFast(oldId);
        }
    }

    const getElapsedSeconds = () => {
        if (!state.isFasting || !state.startTime) return 0;
        return Math.floor((Date.now() - state.startTime) / 1000);
    };

    const setGoal = (hours: number) => {
        setState((prev) => ({ ...prev, goalHours: hours }));
    };

    return {
        ...state,
        startFast,
        endFast,
        cancelFast,
        getElapsedSeconds,
        setGoal,
        isLoaded,
        user
    };
}
