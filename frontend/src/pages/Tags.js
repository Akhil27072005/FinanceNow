import React, { useState, useEffect } from 'react';
import { Card, Table, Form, Alert } from 'react-bootstrap';
import { tagService } from '../services/tagService';
import { cardStyle } from '../styles/cardStyles';
import Modal from '../components/ui/Modal';
import ConfirmationModal from '../components/ui/ConfirmationModal';
import Button from '../components/ui/Button';
import IconButton from '../components/ui/IconButton';

const Tags = () => {
  const [tags, setTags] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [editingTag, setEditingTag] = useState(null);
  const [formData, setFormData] = useState({ name: '', color: '' });

  useEffect(() => {
    loadTags();
  }, []);

  const loadTags = async () => {
    try {
      setLoading(true);
      const response = await tagService.getTags();
      setTags(response.data || []);
      setLoading(false);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load tags');
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingTag) {
        await tagService.updateTag(editingTag._id, formData);
      } else {
        await tagService.createTag(formData);
      }
      setShowModal(false);
      setFormData({ name: '', color: '' });
      setEditingTag(null);
      loadTags();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to save tag');
    }
  };

  const handleDelete = (id) => {
    setDeletingId(id);
    setShowConfirmModal(true);
  };

  const confirmDelete = async () => {
    try {
      await tagService.deleteTag(deletingId);
      loadTags();
      setDeletingId(null);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to delete tag');
      setDeletingId(null);
    }
  };

  const handleEdit = (tag) => {
    setEditingTag(tag);
    setFormData({ name: tag.name, color: tag.color || '' });
    setShowModal(true);
  };

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4" style={{ marginBottom: '24px' }}>
        <h2 style={{ 
          fontWeight: 600, 
          margin: 0,
          fontSize: '24px',
          color: '#111827',
          letterSpacing: '-0.02em'
        }}>
          Tags
        </h2>
        <Button 
          variant="primary"
          onClick={() => { setFormData({ name: '', color: '' }); setEditingTag(null); setShowModal(true); }}
        >
          + Add Tag
        </Button>
      </div>

      {error && <Alert variant="danger" onClose={() => setError('')} dismissible>{error}</Alert>}

      <Card style={cardStyle}>
        <Card.Body style={{ padding: '24px' }}>
          {loading ? (
            <div className="text-center" style={{ padding: '40px' }}>Loading...</div>
          ) : tags.length === 0 ? (
            <div className="text-center text-muted" style={{ padding: '40px' }}>No tags found</div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ 
                width: '100%', 
                borderCollapse: 'collapse',
                fontSize: '14px'
              }}>
                <thead>
                  <tr style={{ 
                    backgroundColor: '#F9FAFB',
                    borderBottom: '1px solid #E5E7EB'
                  }}>
                    <th style={{ 
                      padding: '12px 16px', 
                      textAlign: 'left',
                      fontWeight: 500,
                      color: '#374151',
                      fontSize: '12px',
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em'
                    }}>
                      Name
                    </th>
                    <th style={{ 
                      padding: '12px 16px', 
                      textAlign: 'left',
                      fontWeight: 500,
                      color: '#374151',
                      fontSize: '12px',
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em'
                    }}>
                      Color
                    </th>
                    <th style={{ 
                      padding: '12px 16px', 
                      textAlign: 'left',
                      fontWeight: 500,
                      color: '#374151',
                      fontSize: '12px',
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em'
                    }}>
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {tags.map((tag) => (
                    <tr 
                      key={tag._id}
                      style={{ 
                        borderBottom: '1px solid #E5E7EB',
                        transition: 'background-color 0.2s'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#F9FAFB'}
                      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                    >
                      <td style={{ padding: '16px', color: '#111827', fontSize: '14px' }}>
                        {tag.name}
                      </td>
                      <td style={{ padding: '16px' }}>
                        {tag.color && (
                          <span
                            style={{
                              display: 'inline-block',
                              width: '24px',
                              height: '24px',
                              backgroundColor: tag.color,
                              borderRadius: '6px',
                              border: '1px solid #E5E7EB'
                            }}
                          />
                        )}
                      </td>
                      <td style={{ padding: '16px' }}>
                        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                          <IconButton type="edit" onClick={() => handleEdit(tag)} />
                          <IconButton type="delete" onClick={() => handleDelete(tag._id)} />
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card.Body>
      </Card>

      <Modal
        isOpen={showModal}
        onClose={() => { setShowModal(false); setEditingTag(null); }}
        title={editingTag ? 'Edit Tag' : 'Add Tag'}
      >
        <Form onSubmit={handleSubmit}>
          <Form.Group className="mb-3">
            <Form.Label>Name *</Form.Label>
            <Form.Control
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Color</Form.Label>
            <Form.Control
              type="color"
              value={formData.color || '#000000'}
              onChange={(e) => setFormData({ ...formData, color: e.target.value })}
            />
          </Form.Group>
          <div className="d-flex justify-content-end gap-2 mt-4" style={{ gap: '8px' }}>
            <Button variant="secondary" onClick={() => { setShowModal(false); setEditingTag(null); }}>Cancel</Button>
            <Button variant="primary" type="submit">{editingTag ? 'Update' : 'Create'}</Button>
          </div>
        </Form>
      </Modal>

      <ConfirmationModal
        isOpen={showConfirmModal}
        onClose={() => { setShowConfirmModal(false); setDeletingId(null); }}
        onConfirm={confirmDelete}
        title="Delete Tag"
        message="Are you sure you want to delete this tag? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        variant="danger"
      />
    </div>
  );
};

export default Tags;

