import React from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { AlertTriangle } from 'lucide-react';
import { ModalGlassContext } from '../../contexts/ModalGlassContext';
import Button from './Button';
import '../../styles/modal-glass.css';

/**
 * Confirmation modal with glass UI (matches Modal)
 */
const ConfirmationModal = ({
  isOpen,
  onClose,
  onConfirm,
  title = 'Confirm Action',
  message = 'Are you sure you want to proceed?',
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'danger'
}) => {
  const iconWrapClass =
    variant === 'danger'
      ? 'modal-glass__confirm-icon-wrap modal-glass__confirm-icon-wrap--danger'
      : 'modal-glass__confirm-icon-wrap modal-glass__confirm-icon-wrap--primary';

  return (
    <Transition show={isOpen} as={React.Fragment}>
      <Dialog as="div" className="modal-glass" onClose={onClose}>
        <Transition.Child
          as={React.Fragment}
          enter="modal-glass-enter--backdrop"
          enterFrom="modal-glass-enter-from--backdrop"
          enterTo="modal-glass-enter-to--backdrop"
          leave="modal-glass-leave--backdrop"
          leaveFrom="modal-glass-leave-from--backdrop"
          leaveTo="modal-glass-leave-to--backdrop"
        >
          <div className="modal-glass__backdrop" aria-hidden />
        </Transition.Child>

        <div className="modal-glass__scroll">
          <div className="modal-glass__center">
            <Transition.Child
              as={React.Fragment}
              enter="modal-glass-enter--panel"
              enterFrom="modal-glass-enter-from--panel"
              enterTo="modal-glass-enter-to--panel"
              leave="modal-glass-leave--panel"
              leaveFrom="modal-glass-leave-from--panel"
              leaveTo="modal-glass-leave-to--panel"
            >
              <Dialog.Panel className="modal-glass__panel modal-glass__panel--confirm">
                <div className={iconWrapClass}>
                  <AlertTriangle size={24} strokeWidth={2} aria-hidden />
                </div>
                <Dialog.Title as="h3" className="modal-glass__title">
                  {title}
                </Dialog.Title>
                <ModalGlassContext.Provider value={true}>
                  <p className="modal-glass__confirm-message">{message}</p>
                  <div className="modal-glass__confirm-actions">
                  <Button variant="secondary" onClick={onClose} size="md">
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
                </ModalGlassContext.Provider>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
};

export default ConfirmationModal;
