import React from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { X } from 'lucide-react';
import { ModalGlassContext } from '../../contexts/ModalGlassContext';
import '../../styles/modal-glass.css';

/**
 * Glass modal — frosted panel over blurred page-tinted backdrop
 */
const Modal = ({ isOpen, onClose, title, children, size = 'md' }) => {
  const panelClass = `modal-glass__panel modal-glass__panel--${size}`;

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
              <Dialog.Panel className={panelClass}>
                {title && (
                  <div className="modal-glass__header">
                    <Dialog.Title as="h3" className="modal-glass__title">
                      {title}
                    </Dialog.Title>
                    <button
                      type="button"
                      onClick={onClose}
                      className="modal-glass__close"
                      aria-label="Close"
                    >
                      <X size={18} strokeWidth={2} aria-hidden />
                    </button>
                  </div>
                )}

                <ModalGlassContext.Provider value={true}>
                  <div className="modal-glass__body">{children}</div>
                </ModalGlassContext.Provider>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
};

export default Modal;
