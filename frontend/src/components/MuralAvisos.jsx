import { useEffect, useState } from 'react';

const MuralAvisos = () => {
  const [avisos, setAvisos] = useState([]);

  useEffect(() => {
    fetch('http://localhost:3001/api/avisos')
      .then(res => res.json())
      .then(data => setAvisos(data))
      .catch(err => console.error("Erro ao carregar avisos:", err));
  }, []);

  return (
    <div style={{ padding: '20px', background: '#1e1e1e', color: '#fff', borderRadius: '8px', marginTop: '20px' }}>
      <h2>📢 Mural de Avisos</h2>
      {avisos.length > 0 ? (
        avisos.map(aviso => (
          <div key={aviso.id} style={{ marginBottom: '15px', borderBottom: '1px solid #444', paddingBottom: '10px' }}>
            <h3>{aviso.titulo}</h3>
            <p>{aviso.conteudo}</p>
            <small style={{ color: '#aaa' }}>{new Date(aviso.data_criacao).toLocaleDateString()}</small>
          </div>
        ))
      ) : (
        <p>Nenhum aviso cadastrado no momento.</p>
      )}
    </div>
  );
};

export default MuralAvisos;