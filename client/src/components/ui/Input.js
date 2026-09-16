import React from 'react';

export const Input = React.forwardRef(function Input({ className = '', ...props }, ref) {
  return <input ref={ref} className={`input ${className}`.trim()} {...props} />;
});

export const Textarea = React.forwardRef(function Textarea({ className = '', ...props }, ref) {
  return <textarea ref={ref} className={`textarea ${className}`.trim()} {...props} />;
});
