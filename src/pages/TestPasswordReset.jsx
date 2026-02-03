import React from 'react';
import { Link } from 'react-router-dom';

const TestPasswordReset = () => {
  return (
    <div style={{ padding: '20px', textAlign: 'center' }}>
      <h1>Password Reset Test Page</h1>
      <p>This is a test page to verify the password reset route is working.</p>
      <div style={{ marginTop: '20px' }}>
        <Link to="/login" style={{ marginRight: '10px' }}>Back to Login</Link>
        <Link to="/">Home</Link>
      </div>
    </div>
  );
};

export default TestPasswordReset;
