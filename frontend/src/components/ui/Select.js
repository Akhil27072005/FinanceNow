import React from 'react';
import { Menu, Transition } from '@headlessui/react';
import { ChevronDown, Check } from 'lucide-react';
import { useModalGlass } from '../../contexts/ModalGlassContext';

/**
 * Custom Select Component using Headless UI Menu
 * Replaces Bootstrap Form.Select with modern fintech styling
 */
const Select = ({
  value,
  onChange,
  options = [],
  placeholder = 'Select...',
  disabled = false,
  required = false,
  className = '',
  glass = false,
  ...props
}) => {
  const inModalGlass = useModalGlass();
  const useGlass = glass || inModalGlass;
  const selectedOption = options.find((opt) => opt.value === value);
  const displayValue = selectedOption ? selectedOption.label : placeholder;

  const defaultButtonStyle = {
    width: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '10px 12px',
    borderRadius: '10px',
    border: '1px solid var(--border-light)',
    backgroundColor: disabled ? 'var(--bg-main)' : 'var(--bg-card)',
    color: selectedOption ? 'var(--text-primary)' : 'var(--text-secondary)',
    fontSize: '14px',
    fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
    cursor: disabled ? 'not-allowed' : 'pointer',
    transition: 'all 0.2s ease',
    outline: 'none',
    opacity: disabled ? 0.6 : 1
  };

  const triggerClassName = useGlass
    ? `modal-glass__select-trigger${!selectedOption ? ' modal-glass__select-trigger--placeholder' : ''}`
    : '';

  return (
    <Menu
      as="div"
      className={`relative ui-select ${useGlass ? 'ui-select--glass' : ''} ${className}`.trim()}
      style={{ width: '100%' }}
    >
      {({ open }) => (
        <>
          <Menu.Button
            disabled={disabled}
            className={triggerClassName}
            style={useGlass ? undefined : defaultButtonStyle}
            onMouseEnter={
              useGlass || disabled
                ? undefined
                : (e) => {
                    e.currentTarget.style.borderColor = 'var(--info)';
                    e.currentTarget.style.boxShadow = '0 0 0 2px rgba(41, 121, 255, 0.1)';
                  }
            }
            onMouseLeave={
              useGlass || disabled
                ? undefined
                : (e) => {
                    e.currentTarget.style.borderColor = 'var(--border-light)';
                    e.currentTarget.style.boxShadow = 'none';
                  }
            }
            onFocus={
              useGlass || disabled
                ? undefined
                : (e) => {
                    e.currentTarget.style.borderColor = 'var(--info)';
                    e.currentTarget.style.boxShadow = '0 0 0 2px rgba(41, 121, 255, 0.15)';
                  }
            }
            onBlur={
              useGlass || disabled
                ? undefined
                : (e) => {
                    e.currentTarget.style.borderColor = 'var(--border-light)';
                    e.currentTarget.style.boxShadow = 'none';
                  }
            }
            {...props}
          >
            <span className="ui-select__value">{displayValue}</span>
            <ChevronDown
              size={16}
              strokeWidth={1.75}
              className="ui-select__chevron"
              style={{
                transform: open ? 'rotate(180deg)' : 'rotate(0deg)'
              }}
            />
          </Menu.Button>

          {useGlass ? (
            <Menu.Items
              anchor="bottom start"
              transition
              className="modal-glass__select-menu"
              style={{ outline: 'none', boxSizing: 'border-box' }}
            >
              {options.map((option) => (
                <Menu.Item key={option.value}>
                  {({ active }) => (
                    <button
                      type="button"
                      className={`modal-glass__select-option ${active ? 'modal-glass__select-option--active' : ''} ${value === option.value ? 'modal-glass__select-option--selected' : ''}`}
                      onClick={() => {
                        if (onChange) {
                          const syntheticEvent = { target: { value: option.value } };
                          onChange(syntheticEvent);
                        }
                      }}
                    >
                      <span>{option.label}</span>
                      {value === option.value && (
                        <Check size={16} strokeWidth={2} style={{ color: '#7c3aed' }} />
                      )}
                    </button>
                  )}
                </Menu.Item>
              ))}
            </Menu.Items>
          ) : (
            <Transition
              show={open}
              as={React.Fragment}
              enter="transition ease-out duration-150"
              enterFrom="opacity-0 translate-y-1"
              enterTo="opacity-100 translate-y-0"
              leave="transition ease-in duration-100"
              leaveFrom="opacity-100 translate-y-0"
              leaveTo="opacity-0 translate-y-1"
            >
              <Menu.Items
                static
                style={{
                  position: 'absolute',
                  zIndex: 9999,
                  marginTop: '4px',
                  maxWidth: '100%',
                  width: '100%',
                  backgroundColor: 'var(--bg-card)',
                  borderRadius: '12px',
                  border: '1px solid var(--border-light)',
                  boxShadow: 'var(--shadow-md)',
                  padding: '6px',
                  maxHeight: '240px',
                  overflowY: 'auto',
                  outline: 'none',
                  boxSizing: 'border-box'
                }}
              >
                {options.map((option) => (
                  <Menu.Item key={option.value}>
                    {({ active }) => (
                      <button
                        type="button"
                        onClick={() => {
                          if (onChange) {
                            const syntheticEvent = { target: { value: option.value } };
                            onChange(syntheticEvent);
                          }
                        }}
                        style={{
                          width: '100%',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: '8px 12px',
                          borderRadius: '8px',
                          fontSize: '14px',
                          fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
                          backgroundColor: active ? 'var(--bg-main)' : 'transparent',
                          color: value === option.value ? 'var(--info)' : 'var(--text-primary)',
                          fontWeight: value === option.value ? 500 : 400,
                          border: 'none',
                          cursor: 'pointer',
                          transition: 'all 0.15s ease',
                          outline: 'none',
                          textAlign: 'left'
                        }}
                      >
                        <span>{option.label}</span>
                        {value === option.value && (
                          <Check size={16} strokeWidth={2} style={{ color: 'var(--info)' }} />
                        )}
                      </button>
                    )}
                  </Menu.Item>
                ))}
              </Menu.Items>
            </Transition>
          )}
        </>
      )}
    </Menu>
  );
};

export default Select;

