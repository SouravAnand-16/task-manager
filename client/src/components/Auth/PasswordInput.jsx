import { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons';

const PasswordInput = ({ value, onChange, errors }) => {
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
        aria-invalid={!!errors.password}
        aria-describedby={errors.password ? "username-error" : undefined}
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
        <FontAwesomeIcon icon={showPassword ? faEyeSlash : faEye} />
      </span>
       {errors && (
        <span
          id="password-error"
          role="alert"
          aria-live="assertive"
          style={{
            color: 'red',  
            fontSize: '12px',
            marginTop: '5px',}}
        >
          {errors.password || ''}
        </span>
      )}
    </div>
  );
};

export default PasswordInput;
