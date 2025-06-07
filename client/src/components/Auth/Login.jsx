import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';

import {
  loginUser
} from '../../utils/util';

import { setUser } from '../../redux/userSlice';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { token, user } = await loginUser(username, password);

      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));

      dispatch(setUser({ user, token }));

      navigate(user.role === "admin" ? "/admin" : "/user");
    } catch (err) {
      alert(err.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-form">
      <h2>Login</h2>
      <form onSubmit={handleLogin}>
        <input
          type="text"
          placeholder="Username"
          required
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
        <br />
        <input
          type="password"
          placeholder="Password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <br />
        <button type="submit" disabled={loading}>
          {loading ? <span><i className="fas fa-spinner fa-spin"></i> Logging in...</span> : 'Login'}
        </button>
      </form>
    </div>
  );
};

export default Login;
