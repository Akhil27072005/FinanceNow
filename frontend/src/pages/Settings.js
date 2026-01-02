import React, { useState } from 'react';
import { Card, Alert } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { cardStyle } from '../styles/cardStyles';
import Button from '../components/ui/Button';

const Settings = () => {
  const navigate = useNavigate();
  const { logout, user } = useAuth();
  const [error, setError] = useState('');

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (err) {
      setError('Failed to logout');
    }
  };

  return (
    <div>
      <h2 style={{ 
        fontWeight: 600, 
        marginBottom: '24px',
        fontSize: '24px',
        color: '#111827',
        letterSpacing: '-0.02em'
      }}>
        Settings
      </h2>

      {error && <Alert variant="danger" onClose={() => setError('')} dismissible>{error}</Alert>}

      <Card style={{ ...cardStyle, maxWidth: '600px' }}>
        <Card.Header style={{ 
          backgroundColor: '#ffffff', 
          borderBottom: '1px solid #e5e7eb', 
          fontWeight: 600,
          padding: '20px 28px',
          fontSize: '16px',
          color: '#111827'
        }}>
          Account
        </Card.Header>
        <Card.Body style={{ padding: '28px' }}>
          {user && (
            <div className="mb-4">
              <div style={{ marginBottom: '10px' }}>
                <strong>Name:</strong> {user.name || 'N/A'}
              </div>
              <div style={{ marginBottom: '10px' }}>
                <strong>Email:</strong> {user.email || 'N/A'}
              </div>
              <div>
                <strong>Auth Provider:</strong> {user.authProvider || 'N/A'}
              </div>
            </div>
          )}
          <Button variant="danger" onClick={handleLogout}>
            Logout
          </Button>
        </Card.Body>
      </Card>
    </div>
  );
};

export default Settings;

