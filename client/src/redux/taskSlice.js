import { createSlice } from '@reduxjs/toolkit';

const taskSlice = createSlice({
  name: 'tasks',
  initialState: { tasks: [], selectedTaskIds: [] },
  reducers: {
    setTasks(state, action) {
      state.tasks = action.payload;
    },
    toggleSelect(state, action) {
      const id = action.payload;
      if (state.selectedTaskIds.includes(id)) {
        state.selectedTaskIds = state.selectedTaskIds.filter(i => i !== id);
      } else {
        state.selectedTaskIds.push(id);
      }
    },
    selectAll(state, action) {
      state.selectedTaskIds = action.payload; // expects array of task IDs
    },
    clearSelection(state) {
      state.selectedTaskIds = [];
    }
  }
});

export const { setTasks, toggleSelect, selectAll, clearSelection } = taskSlice.actions;
export default taskSlice.reducer;
