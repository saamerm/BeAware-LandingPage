// Holds variables that change during the app's lifecycle (like polling speed or the current user).

export const state = {
    pollingInterval: 2000,
    pollingTimer: null,
    consecutiveNoChange: 0,
    lastDataString: "",
    currentUserUid: null
};

// Helper to reset polling when interaction happens
export function resetPolling() {
    state.pollingInterval = 2000;
    state.consecutiveNoChange = 0;
}