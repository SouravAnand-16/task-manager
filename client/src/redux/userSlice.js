import { createSlice } from '@reduxjs/toolkit';

const userSlice = createSlice({
  name: 'user',
  initialState: { user: null, token: null },
  reducers: {
    setUser(state, action) {
      const { user, token } = action.payload;
      state.user = user;
      state.token = token;
    },
    logout(state) {
      state.user = null;
      state.token = null;
    }
  }
});

export const { setUser, logout } = userSlice.actions;
export default userSlice.reducer;
