import React from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { X } from 'lucide-react';

/**
 * Custom Modal Component using Headless UI
 * Replaces Bootstrap modals with modern fintech styling
 */
const Modal = ({ isOpen, onClose, title, children, size = 'md' }) => {
  const sizeStyles = {
    sm: { maxWidth: '28rem' },
    md: { maxWidth: '32rem' },
    lg: { maxWidth: '42rem' },
    xl: { maxWidth: '56rem' }
  };

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
                  ...sizeStyles[size],
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
                {/* Header */}
                {title && (
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginBottom: '1rem',
                    paddingBottom: '1rem',
                    borderBottom: '1px solid var(--border-light)'
                  }}>
                    <Dialog.Title
                      as="h3"
                      style={{
                        fontSize: '18px',
                        fontWeight: 600,
                        lineHeight: '1.5',
                        color: 'var(--text-primary)',
                        margin: 0
                      }}
                    >
                      {title}
                    </Dialog.Title>
                    <button
                      onClick={onClose}
                      style={{
                        padding: '4px',
                        color: '#9ca3af',
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        transition: 'color 0.2s ease'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.color = '#4b5563'}
                      onMouseLeave={(e) => e.currentTarget.style.color = '#9ca3af'}
                    >
                      <X size={20} strokeWidth={1.75} />
                    </button>
                  </div>
                )}

                {/* Content */}
                <div style={{ marginTop: '0.5rem' }}>
                  {children}
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
};

export default Modal;

