import { useState } from 'react';

const PasswordInput = ({ value, onChange }) => {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div style={{ position: 'relative', width: '100%' }}>
      <input
        type={showPassword ? 'text' : 'password'}
        value={value}
        onChange={onChange}
        placeholder="Password"
        required
        style={{
          width: '100%',
          paddingRight: '30px',
          boxSizing: 'border-box',
        }}
      />
      <span
        onClick={() => setShowPassword(!showPassword)}
        style={{
          position: 'absolute',
          right: '8px',
          top: '50%',
          transform: 'translateY(-50%)',
          cursor: 'pointer',
          userSelect: 'none',
          color: '#888',
          fontSize: '16px',
        }}
        aria-label={showPassword ? "Hide password" : "Show password"}
      >
        {showPassword ? '👁️‍🗨️' : '👁️'}
      </span>
    </div>
  );
};

export default PasswordInput;
