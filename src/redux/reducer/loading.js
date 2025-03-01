import { createSlice } from '@reduxjs/toolkit';

const loadingReducer = createSlice({
    name: 'loading',
    initialState: {
        isLoading: false,
    },
    reducers: {
        startLoadingGlobal: (state) => {
            state.isLoading = true;
        },
        stopLoadingGlobal: (state) => {
            state.isLoading = false;
        },
    },
});

export const { startLoadingGlobal, stopLoadingGlobal } = loadingReducer.actions;

export default loadingReducer.reducer;
