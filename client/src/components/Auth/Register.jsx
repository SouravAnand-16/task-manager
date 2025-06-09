import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { registerUser } from '../../utils/util';
import PasswordInput from './PasswordInput';

const Register = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});
    try {
      await registerUser(username, password);
      alert('Registration successful!');
      navigate('/login');
    } catch (err) {
      const message = err.response?.data?.message || 'Registration failed';
      if (message === 'username not available') {
        setErrors({ message: message });
      } else {
        alert(message);
      }
      console.error('Registration error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.overlay}>
        <form onSubmit={handleRegister} style={styles.form}>
          <h2 style={styles.title}>Register</h2>
          <input
            type="text"
            placeholder="Username"
            required
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            style={styles.input}
          />
          {errors.message && (
            <span
              style={{ color: 'red', fontSize: '12px' }}
              role="alert"
              aria-live="assertive"
            >
              {errors.message}
            </span>
          )}
          <PasswordInput
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            errors={errors}
          />
          <button type="submit" disabled={loading} style={styles.button}>
            {loading ? (
              <span>
                <i className="fas fa-spinner fa-spin"></i> Registering...
              </span>
            ) : (
              'Register'
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

const styles = {
  container: {
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #7b1fa2, #512da8)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    padding: '20px',
  },
  overlay: {
    width: '100%',
    maxWidth: '400px',
    background: 'rgba(255, 255, 255, 0.95)',
    padding: '30px',
    borderRadius: '16px',
    boxShadow: '0 8px 24px rgba(0,0,0,0.2)',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  title: {
    margin: 0,
    textAlign: 'center',
    color: '#512da8',
    fontWeight: 'bold',
    fontSize: '24px',
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
    fontSize: '15px',
    borderRadius: '6px',
    border: 'none',
    background: 'linear-gradient(to right, #7b1fa2, #512da8)',
    color: '#fff',
    cursor: 'pointer',
    fontWeight: 'bold',
    transition: 'all 0.3s ease',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
  },
};

export default Register;
