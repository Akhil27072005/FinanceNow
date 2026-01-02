import React, { useState, useRef, useEffect } from 'react';
import { Menu, Transition } from '@headlessui/react';
import { ChevronDown, Check } from 'lucide-react';

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
  ...props 
}) => {
  const selectedOption = options.find(opt => opt.value === value);
  const displayValue = selectedOption ? selectedOption.label : placeholder;

  return (
    <Menu as="div" className={`relative ${className}`} style={{ width: '100%' }}>
      {({ open }) => (
        <>
          <Menu.Button
            disabled={disabled}
            style={{
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
            }}
            onMouseEnter={(e) => {
              if (!disabled) {
                e.currentTarget.style.borderColor = 'var(--info)';
                e.currentTarget.style.boxShadow = '0 0 0 2px rgba(41, 121, 255, 0.1)';
              }
            }}
            onMouseLeave={(e) => {
              if (!disabled) {
                e.currentTarget.style.borderColor = 'var(--border-light)';
                e.currentTarget.style.boxShadow = 'none';
              }
            }}
            onFocus={(e) => {
              if (!disabled) {
                e.currentTarget.style.borderColor = 'var(--info)';
                e.currentTarget.style.boxShadow = '0 0 0 2px rgba(41, 121, 255, 0.15)';
              }
            }}
            onBlur={(e) => {
              if (!disabled) {
                e.currentTarget.style.borderColor = 'var(--border-light)';
                e.currentTarget.style.boxShadow = 'none';
              }
            }}
            {...props}
          >
            <span style={{ 
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              flex: 1,
              textAlign: 'left'
            }}>
              {displayValue}
            </span>
            <ChevronDown 
              size={16} 
              strokeWidth={1.75}
              style={{
                marginLeft: '8px',
                flexShrink: 0,
                transition: 'transform 0.2s ease',
                transform: open ? 'rotate(180deg)' : 'rotate(0deg)',
                color: 'var(--text-secondary)'
              }}
            />
          </Menu.Button>

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
                          // Support both direct onChange and event-based onChange
                          if (typeof onChange === 'function') {
                            const syntheticEvent = { target: { value: option.value } };
                            onChange(syntheticEvent);
                          }
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
        </>
      )}
    </Menu>
  );
};

export default Select;

