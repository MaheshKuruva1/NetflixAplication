/**
 * @file src/components/ui/Input.jsx
 * @description Premium form input with icon support, validation states,
 * password toggle, and search variant.
 */

import { useState, forwardRef, useId } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  RiEyeLine, RiEyeOffLine,
  RiSearchLine, RiCloseLine,
  RiCheckLine, RiErrorWarningLine,
} from 'react-icons/ri';
import { cn } from '@utils/cn.js';

/* ── Sizes ─────────────────────────────────────────────────────────────────── */
const SIZES = {
  sm: { wrap: 'h-9',  input: 'px-3 text-sm',    icon: 'text-base',   label: 'text-xs' },
  md: { wrap: 'h-11', input: 'px-4 text-[0.9375rem]', icon: 'text-lg', label: 'text-sm' },
  lg: { wrap: 'h-13', input: 'px-5 text-base',   icon: 'text-xl',   label: 'text-base' },
};

/* ── Input ──────────────────────────────────────────────────────────────────── */
const Input = forwardRef(function Input(
  {
    type         = 'text',
    size         = 'md',
    label,
    placeholder,
    helperText,
    errorText,
    successText,
    leftIcon,
    rightIcon,
    onClear,
    value,
    defaultValue,
    onChange,
    disabled     = false,
    readOnly     = false,
    fullWidth    = true,
    wrapperClass,
    className,
    id: idProp,
    ...props
  },
  ref
) {
  const autoId = useId();
  const id = idProp ?? autoId;
  const [showPassword, setShowPassword] = useState(false);
  const [internalValue, setInternalValue] = useState(defaultValue ?? '');

  const isControlled = value !== undefined;
  const currentValue = isControlled ? value : internalValue;

  const hasError   = !!errorText;
  const hasSuccess = !!successText && !hasError;

  const s = SIZES[size] ?? SIZES.md;
  const actualType = type === 'password' ? (showPassword ? 'text' : 'password') : type;

  const hasLeftIcon  = !!leftIcon || type === 'search';
  const hasRightIcon = !!rightIcon || type === 'password' ||
                       (type === 'search' && currentValue) ||
                       hasError || hasSuccess;

  const handleChange = (e) => {
    if (!isControlled) setInternalValue(e.target.value);
    onChange?.(e);
  };

  const handleClear = () => {
    if (!isControlled) setInternalValue('');
    onClear?.();
  };

  return (
    <div className={cn('flex flex-col gap-1.5', fullWidth && 'w-full', wrapperClass)}>
      {/* Label */}
      {label && (
        <label
          htmlFor={id}
          className={cn(s.label, 'font-medium select-none')}
          style={{ color: hasError ? 'var(--color-error-text)' : 'var(--fg-secondary)' }}
        >
          {label}
        </label>
      )}

      {/* Input Wrapper */}
      <div className={cn('relative flex items-center', s.wrap, fullWidth && 'w-full')}>
        {/* Left Icon */}
        {hasLeftIcon && (
          <span
            className={cn(
              'absolute left-3.5 flex items-center pointer-events-none',
              s.icon,
              'transition-colors duration-150'
            )}
            style={{ color: 'var(--fg-muted)' }}
            aria-hidden="true"
          >
            {leftIcon ?? <RiSearchLine />}
          </span>
        )}

        {/* Input Element */}
        <input
          ref={ref}
          id={id}
          type={actualType}
          value={isControlled ? value : internalValue}
          onChange={handleChange}
          disabled={disabled}
          readOnly={readOnly}
          placeholder={placeholder}
          className={cn(
            'input-base h-full',
            hasLeftIcon  && 'pl-10',
            hasRightIcon && 'pr-11',
            hasError     && 'input-error',
            hasSuccess   && 'input-success',
            disabled     && 'cursor-not-allowed',
            className
          )}
          aria-invalid={hasError}
          aria-describedby={
            (helperText || errorText || successText)
              ? `${id}-helper`
              : undefined
          }
          {...props}
        />

        {/* Right Icons */}
        <span className="absolute right-3.5 flex items-center gap-2">
          {/* Status Icons */}
          <AnimatePresence mode="wait">
            {hasError && (
              <motion.span
                key="err"
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.5, opacity: 0 }}
                transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                className={cn(s.icon)}
                style={{ color: 'var(--color-error-text)' }}
                aria-hidden="true"
              >
                <RiErrorWarningLine />
              </motion.span>
            )}
            {hasSuccess && (
              <motion.span
                key="ok"
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.5, opacity: 0 }}
                transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                className={cn(s.icon)}
                style={{ color: 'var(--color-success-text)' }}
                aria-hidden="true"
              >
                <RiCheckLine />
              </motion.span>
            )}
          </AnimatePresence>

          {/* Search clear button */}
          {type === 'search' && currentValue && !hasError && !hasSuccess && (
            <button
              type="button"
              onClick={handleClear}
              className={cn(
                s.icon, 'flex items-center justify-center rounded-full',
                'opacity-60 hover:opacity-100 transition-opacity'
              )}
              style={{ color: 'var(--fg-muted)' }}
              aria-label="Clear search"
            >
              <RiCloseLine />
            </button>
          )}

          {/* Custom right icon */}
          {rightIcon && !hasError && !hasSuccess && (
            <span className={cn(s.icon, 'flex items-center pointer-events-none')}
              style={{ color: 'var(--fg-muted)' }} aria-hidden="true">
              {rightIcon}
            </span>
          )}

          {/* Password toggle */}
          {type === 'password' && (
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              className={cn(
                s.icon, 'flex items-center justify-center rounded-full',
                'opacity-60 hover:opacity-100 transition-opacity'
              )}
              style={{ color: 'var(--fg-muted)' }}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? <RiEyeOffLine /> : <RiEyeLine />}
            </button>
          )}
        </span>
      </div>

      {/* Helper / Error / Success text */}
      <AnimatePresence mode="wait">
        {(helperText || errorText || successText) && (
          <motion.p
            id={`${id}-helper`}
            key={errorText ?? successText ?? helperText}
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.15 }}
            className="text-xs font-medium px-1"
            style={{
              color: hasError
                ? 'var(--color-error-text)'
                : hasSuccess
                ? 'var(--color-success-text)'
                : 'var(--fg-muted)',
            }}
          >
            {errorText ?? successText ?? helperText}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
});

export default Input;

/* ── Search Input shorthand ────────────────────────────────────────────────── */
export function SearchInput(props) {
  return <Input type="search" {...props} />;
}

/* ── Textarea ───────────────────────────────────────────────────────────────── */
export const Textarea = forwardRef(function Textarea(
  { label, helperText, errorText, rows = 4, wrapperClass, className, id: idProp, ...props },
  ref
) {
  const autoId = useId();
  const id = idProp ?? autoId;
  const hasError = !!errorText;

  return (
    <div className={cn('flex flex-col gap-1.5 w-full', wrapperClass)}>
      {label && (
        <label htmlFor={id} className="text-sm font-medium" style={{ color: 'var(--fg-secondary)' }}>
          {label}
        </label>
      )}
      <textarea
        ref={ref}
        id={id}
        rows={rows}
        className={cn(
          'input-base resize-y py-3 leading-relaxed',
          hasError && 'input-error',
          className
        )}
        aria-invalid={hasError}
        {...props}
      />
      {(helperText || errorText) && (
        <p className="text-xs font-medium px-1"
          style={{ color: hasError ? 'var(--color-error-text)' : 'var(--fg-muted)' }}>
          {errorText ?? helperText}
        </p>
      )}
    </div>
  );
});
