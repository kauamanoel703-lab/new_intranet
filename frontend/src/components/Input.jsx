import React from 'react';

const applyMask = (val, mask) => {
  if (mask === 'cpf') {
    return val
      .replace(/\D/g, '')
      .slice(0, 11)
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d{1,2})$/, '$1-$2');
  }

  if (mask === 'telefone') {
    return val
      .replace(/\D/g, '')
      .slice(0, 11)
      .replace(/(\d{2})(\d)/, '($1) $2')
      .replace(/(\d{5})(\d{1,4})$/, '$1-$2');
  }

  if (mask === 'cnpj') {
    return val
      .replace(/\D/g, '')
      .slice(0, 14)
      .replace(/(\d{2})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d)/, '$1/$2')
      .replace(/(\d{4})(\d{1,2})$/, '$1-$2');
  }

  if (mask === 'cep') {
    return val
      .replace(/\D/g, '')
      .slice(0, 8)
      .replace(/(\d{5})(\d{1,3})$/, '$1-$2');
  }

  return val;
};

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
    let val = mask ? applyMask(e.target.value, mask) : e.target.value;

    // Limita senha a 6 caracteres
    if (type === 'password') {
      val = val.slice(0, 6);
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