import React from 'react';

const Input = ({ 
  label, 
  name, 
  value, 
  onChange, 
  type = 'text', 
  placeholder = '', 
  mask, 
  required = false,
  error 
}) => {
  const handleChange = (e) => {
    let val = e.target.value;

    if (mask) {
      if (mask === 'cpf') {
        val = val
          .replace(/\D/g, '')
          .replace(/(\d{3})(\d)/, '.')
          .replace(/(\d{3})(\d)/, '.')
          .replace(/(\d{3})(\d{1,2})$/, '-');
      }
      else if (mask === 'telefone') {
        val = val
          .replace(/\D/g, '')
          .replace(/(\d{2})(\d)/, '() ')
          .replace(/(\d{5})(\d)/, '-')
          .replace(/(-\d{4})\d+?$/, '');
      }
      else if (mask === 'cnpj') {
        val = val
          .replace(/\D/g, '')
          .replace(/(\d{2})(\d)/, '.')
          .replace(/(\d{3})(\d)/, '.')
          .replace(/(\d{3})(\d)/, '/')
          .replace(/(\d{4})(\d)/, '-')
          .replace(/(-\d{2})\d+?$/, '');
      }
      else if (mask === 'cep') {
        val = val
          .replace(/\D/g, '')
          .replace(/(\d{5})(\d)/, '-')
          .replace(/(-\d{3})\d+?$/, '');
      }
    }

    onChange(name, val);
  };

  return (
    <div style={{ marginBottom: '16px' }}>
      {label && (
        <label htmlFor={name} style={{ display: 'block', marginBottom: '4px', fontWeight: 'bold' }}>
          {label} {required && <span style={{ color: 'red' }}>*</span>}
        </label>
      )}
      <input
        id={name}
        name={name}
        type={type}
        value={value}
        onChange={handleChange}
        placeholder={placeholder}
        style={{
          width: '100%',
          padding: '10px',
          borderRadius: '4px',
          border: error ? '2px solid red' : '1px solid #ccc',
          fontSize: '16px'
        }}
      />
      {error && <span style={{ color: 'red', fontSize: '14px' }}>{error}</span>}
    </div>
  );
};

export default Input;
