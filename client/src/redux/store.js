import { configureStore } from '@reduxjs/toolkit';
import userReducer from './userSlice';
import taskReducer from './taskSlice';

export default configureStore({
  reducer: {
    user: userReducer,
    tasks: taskReducer
  }
});
