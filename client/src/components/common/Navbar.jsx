import React from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../../redux/userSlice';

const Navbar = () => {
  const { user } = useSelector(state => state.user);
  const dispatch = useDispatch();

  const handleLogout = () => {
    dispatch(logout());
    localStorage.removeItem('token');
  };

  return (
    <nav style={{ background: '#333', padding: '10px' }}>
      <Link to="/" style={{ color: '#fff', marginRight: '10px' }}>Home</Link>
      {!user && (
        <>
          <Link to="/login" style={{ color: '#fff', marginRight: '10px' }}>Login</Link>
          <Link to="/register" style={{ color: '#fff' }}>Register</Link>
        </>
      )}
      {user && (
        <>
          <span style={{ color: '#fff', marginRight: '10px' }}>Welcome, {user.username}</span>
          {user.role === 'admin' ? (
            <Link to="/admin" style={{ color: '#fff', marginRight: '10px' }}>Admin Panel</Link>
          ) : (
            <Link to="/user" style={{ color: '#fff', marginRight: '10px' }}>User Panel</Link>
          )}
          <button onClick={handleLogout} style={{ padding: '5px 10px' }}>Logout</button>
        </>
      )}
    </nav>
  );
};

export default Navbar;
