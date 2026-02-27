import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import type { AuthState, User } from "@/types/auth";

const initialState: AuthState = {
    token: null,
    user: null,
    isAuthenticated: false,
};

type SetCredentialsPayload = {
    token: string;
    user: User;
};

const authSlice = createSlice({
    name: "auth",
    initialState,
    reducers: {
        setCredentials: (state, action: PayloadAction<SetCredentialsPayload>) => {
            state.token = action.payload.token;
            state.user = action.payload.user;
            state.isAuthenticated = true;
        },
        logout: (state) => {
            state.token = null;
            state.user = null;
            state.isAuthenticated = false;
        },
        updateProfile: (state, action: PayloadAction<Partial<User>>) => {
            if (!state.user) return;
            state.user = { ...state.user, ...action.payload };
        },
    },
});

export const { setCredentials, logout, updateProfile } = authSlice.actions;
export default authSlice.reducer;
                