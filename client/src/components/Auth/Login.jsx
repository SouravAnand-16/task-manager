import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';

import { loginUser } from '../../utils/util';
import { setUser } from '../../redux/userSlice';
import PasswordInput from './PasswordInput';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setErrors({});
    setLoading(true);

    try {
      const { token, user } = await loginUser(username, password);

      if (!token || !user) {
        throw new Error('Login failed');
      }

      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));

      dispatch(setUser({ user, token }));
      navigate(user.role === 'admin' ? '/admin' : '/user');
    } catch (err) {
      const message = err.response?.data?.message || 'Login failed';
      const newErrors = {};

      if (message === 'User not found') {
        newErrors.username = message;
      } else if (message === 'Invalid credentials') {
        newErrors.password = message;
      } else {
        alert(message);
      }

      setErrors(newErrors);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <form onSubmit={handleLogin} style={styles.form}>
        <h2 style={styles.title}>Welcome Back 👋</h2>
        <p style={styles.subtitle}>Please login to your account</p>

        <div style={styles.formGroup}>
          <label htmlFor="username" style={styles.label}>Username</label>
          <input
            id="username"
            type="text"
            required
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            style={styles.input}
            aria-invalid={!!errors.username}
            aria-describedby={errors.username ? 'username-error' : undefined}
          />
          {errors.username && (
            <span
              id="username-error"
              role="alert"
              aria-live="assertive"
              style={styles.error}
            >
              {errors.username}
            </span>
          )}
        </div>

        <div style={styles.formGroup}>
          <label htmlFor="password" style={styles.label}>Password</label>
          <PasswordInput
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            errors={errors}
          />
          {errors.password && (
            <span
              id="password-error"
              role="alert"
              aria-live="assertive"
              style={styles.error}
            >
              {errors.password}
            </span>
          )}
        </div>

        <button type="submit" disabled={loading} style={styles.button}>
          {loading ? (
            <span>
              <i className="fas fa-spinner fa-spin"></i> Logging in...
            </span>
          ) : (
            'Login'
          )}
        </button>
      </form>
    </div>
  );
};

const styles = {
  container: {
    height: '100vh',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    background: 'linear-gradient(135deg, #7b1fa2, #512da8)',
    padding: '20px',
  },
  form: {
    backgroundColor: '#fff',
    padding: '30px 25px',
    borderRadius: '10px',
    boxShadow: '0 6px 20px rgba(0,0,0,0.1)',
    width: '100%',
    maxWidth: '400px',
    display: 'flex',
    flexDirection: 'column',
    gap: '18px',
  },
  title: {
    margin: 0,
    fontSize: '24px',
    fontWeight: 600,
    textAlign: 'center',
    color: '#512da8',
  },
  subtitle: {
    margin: 0,
    fontSize: '14px',
    textAlign: 'center',
    color: '#7f8c8d',
  },
  formGroup: {
    display: 'flex',
    flexDirection: 'column',
  },
  label: {
    marginBottom: '6px',
    fontSize: '14px',
    color: '#34495e',
  },
  input: {
    padding: '10px 12px',
    fontSize: '14px',
    borderRadius: '6px',
    border: '1px solid #ccc',
    outline: 'none',
  },
  button: {
    padding: '12px',
    fontSize: '16px',
    fontWeight: 'bold',
    borderRadius: '6px',
    border: 'none',
    background: 'linear-gradient(to right, #7b1fa2, #512da8)',
    color: '#fff',
    cursor: 'pointer',
    transition: 'background 0.3s ease',
  },
  error: {
    color: 'red',
    fontSize: '12px',
    marginTop: '4px',
  },
};

export default Login;
