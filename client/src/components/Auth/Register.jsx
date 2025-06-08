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
      const message = err.response?.data?.message || "Registration failed";
      if (message === "username not available") {
        setErrors({ message: message });
      } else {
        alert(message);
      }
      console.error("Registration error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
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
          <span style={{ color: 'red', fontSize: '12px' }}
            role="alert"  
            aria-live="assertive">
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
            "Register"
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
    alignItems: 'center',
    justifyContent: 'center',
    background: '#f4f6f8',
  },
  form: {
    padding: '30px',
    width: '300px',
    borderRadius: '12px',
    background: '#fff',
    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  title: {
    margin: 0,
    textAlign: 'center',
    color: '#333',
  },
  input: {
    padding: '10px 12px',
    fontSize: '14px',
    borderRadius: '6px',
    border: '1px solid #ccc',
    outline: 'none',
  },
  button: {
    padding: '10px 12px',
    fontSize: '14px',
    borderRadius: '6px',
    border: 'none',
    backgroundColor: '#1976d2',
    color: '#fff',
    cursor: 'pointer',
    transition: 'background 0.3s ease',
  },
};

export default Register;
