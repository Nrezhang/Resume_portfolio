import React from 'react';
import { FiEdit2, FiPlus, FiTrash2 } from 'react-icons/fi';

export function AddControl({ label, onClick }) {
  return <button className="editor-add-control" type="button" onClick={onClick} title={label} aria-label={label}><FiPlus /></button>;
}

export function ItemControls({ label, onEdit, onDelete }) {
  return (
    <div className="editor-item-controls" aria-label={`${label} controls`}>
      {onEdit && <button type="button" onClick={onEdit} title={`Edit ${label}`} aria-label={`Edit ${label}`}><FiEdit2 /></button>}
      {onDelete && <button className="danger" type="button" onClick={onDelete} title={`Delete ${label}`} aria-label={`Delete ${label}`}><FiTrash2 /></button>}
    </div>
  );
}
