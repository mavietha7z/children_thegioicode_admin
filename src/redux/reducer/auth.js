import { createSlice } from '@reduxjs/toolkit';

const authReducer = createSlice({
    name: 'auth',
    initialState: {
        currentUser: null,
    },
    reducers: {
        loginAuthSuccess: (state, action) => {
            state.currentUser = action.payload;
        },
        logoutAuthSuccess: (state) => {
            state.currentUser = null;
        },
    },
});

export const { loginAuthSuccess, logoutAuthSuccess } = authReducer.actions;

export default authReducer.reducer;
