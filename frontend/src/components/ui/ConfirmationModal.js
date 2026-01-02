import React from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { AlertTriangle } from 'lucide-react';
import Button from './Button';

/**
 * ConfirmationModal Component
 * Replaces window.confirm() with a themed modal dialog
 */
const ConfirmationModal = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title = 'Confirm Action',
  message = 'Are you sure you want to proceed?',
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'danger' // 'danger' for delete actions, 'primary' for others
}) => {
  return (
    <Transition show={isOpen} as={React.Fragment}>
      <Dialog as="div" style={{ position: 'relative', zIndex: 50 }} onClose={onClose}>
        {/* Backdrop */}
        <Transition.Child
          as={React.Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.2)',
            backdropFilter: 'blur(4px)'
          }} />
        </Transition.Child>

        {/* Modal Container */}
        <div style={{
          position: 'fixed',
          inset: 0,
          overflowY: 'auto',
          zIndex: 50
        }}>
          <div style={{
            display: 'flex',
            minHeight: '100%',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1rem'
          }}>
            <Transition.Child
              as={React.Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel
                style={{
                  width: '100%',
                  maxWidth: '28rem',
                  transform: 'translateZ(0)',
                  overflow: 'hidden',
                  borderRadius: '16px',
                  backgroundColor: 'var(--bg-card)',
                  padding: '1.5rem',
                  textAlign: 'left',
                  boxShadow: '0 20px 60px rgba(0, 0, 0, 0.15)',
                  transition: 'all 0.3s ease'
                }}
              >
                {/* Icon and Title */}
                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  marginBottom: '1rem'
                }}>
                  <div style={{
                    width: '48px',
                    height: '48px',
                    borderRadius: '50%',
                    backgroundColor: variant === 'danger' 
                      ? 'rgba(255, 82, 82, 0.1)' 
                      : 'rgba(41, 121, 255, 0.1)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: '12px'
                  }}>
                    <AlertTriangle 
                      size={24} 
                      color={variant === 'danger' ? 'var(--danger)' : 'var(--info)'}
                      strokeWidth={2}
                    />
                  </div>
                  <Dialog.Title
                    as="h3"
                    style={{
                      fontSize: '18px',
                      fontWeight: 600,
                      lineHeight: '1.5',
                      color: 'var(--text-primary)',
                      margin: 0,
                      textAlign: 'center'
                    }}
                  >
                    {title}
                  </Dialog.Title>
                </div>

                {/* Message */}
                <div style={{
                  marginBottom: '1.5rem',
                  textAlign: 'center'
                }}>
                  <p style={{
                    fontSize: '14px',
                    color: 'var(--text-secondary)',
                    lineHeight: '1.6',
                    margin: 0
                  }}>
                    {message}
                  </p>
                </div>

                {/* Actions */}
                <div style={{
                  display: 'flex',
                  gap: '10px',
                  justifyContent: 'flex-end'
                }}>
                  <Button
                    variant="secondary"
                    onClick={onClose}
                    size="md"
                  >
                    {cancelText}
                  </Button>
                  <Button
                    variant={variant}
                    onClick={() => {
                      onConfirm();
                      onClose();
                    }}
                    size="md"
                  >
                    {confirmText}
                  </Button>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
};

export default ConfirmationModal;

