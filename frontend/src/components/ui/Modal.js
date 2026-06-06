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
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="modal-glass__backdrop" aria-hidden />
        </Transition.Child>

        <div className="modal-glass__scroll">
          <div className="modal-glass__center">
            <Transition.Child
              as={React.Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
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
