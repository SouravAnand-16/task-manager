import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useDispatch, useSelector } from 'react-redux';
import { setTasks, toggleSelect, selectAll, clearSelection } from '../../redux/taskSlice';

const TaskList = () => {
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const dispatch = useDispatch();
  const { tasks, selectedTaskIds } = useSelector(state => state.tasks);

  const fetchTasks = async (pageNum) => {
    const res = await axios.get(`${process.env.REACT_APP_API_URL}/api/admin/tasks?page=${pageNum}`);
    dispatch(setTasks(res.data.tasks));
    setTotalPages(res.data.totalPages);
  };

  useEffect(() => {
    fetchTasks(page);
  }, [page]);

  const handleSelectAll = () => {
    const currentIds = tasks.map(task => task._id);
    dispatch(selectAll(currentIds));
  };

  const handleBulkUpdate = async () => {
    await axios.patch(`${process.env.REACT_APP_API_URL}/api/admin/tasks/bulk-update`, {
      taskIds: selectedTaskIds
    });
    fetchTasks(page);
    dispatch(clearSelection());
  };

  return (
    <div className="task-list">
      <h3>Task Management</h3>
      <button onClick={handleBulkUpdate} disabled={selectedTaskIds.length === 0}>
        Update Status of Selected ({selectedTaskIds.length})
      </button>
      <table>
        <thead>
          <tr>
            <th><input type="checkbox" onChange={handleSelectAll} /></th>
            <th>Title</th>
            <th>Completed</th>
            <th>Due Date</th>
          </tr>
        </thead>
        <tbody>
          {tasks.map(task => (
            <tr key={task._id}>
              <td>
                <input
                  type="checkbox"
                  checked={selectedTaskIds.includes(task._id)}
                  onChange={() => dispatch(toggleSelect(task._id))}
                />
              </td>
              <td>{task.title}</td>
              <td>{task.completed ? '✅' : '❌'}</td>
              <td>{new Date(task.dueDate).toLocaleDateString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="pagination">
        {[...Array(totalPages)].map((_, i) => (
          <button
            key={i}
            onClick={() => setPage(i + 1)}
            className={page === i + 1 ? 'active' : ''}
          >
            {i + 1}
          </button>
        ))}
      </div>
    </div>
  );
};

export default TaskList;
