import { useEffect, useState } from 'react';
import { listarAvisos } from '../services/api';

const MuralAvisos = () => {
  const [avisos, setAvisos] = useState([]);
  const [erro, setErro] = useState('');

  useEffect(() => {
    listarAvisos()
      .then(data => setAvisos(Array.isArray(data) ? data : []))
      .catch(err => {
        console.error('Erro ao carregar avisos:', err);
        setErro(err.message);
      });
  }, []);

  return (
    <div style={{ padding: '20px', background: '#1e1e1e', color: '#fff', borderRadius: '8px', marginTop: '20px' }}>
      <h2>📢 Mural de Avisos</h2>
      {erro && <p style={{ color: '#fca5a5' }}>⚠️ {erro}</p>}
      {!erro && avisos.length > 0 ? (
        avisos.map(aviso => (
          <div key={aviso.id} style={{ marginBottom: '15px', borderBottom: '1px solid #444', paddingBottom: '10px' }}>
            <h3>{aviso.titulo}</h3>
            <p>{aviso.conteudo}</p>
            <small style={{ color: '#aaa' }}>
              {aviso.data_criacao ? new Date(aviso.data_criacao).toLocaleDateString() : ''}
            </small>
          </div>
        ))
      ) : (
        !erro && <p>Nenhum aviso cadastrado no momento.</p>
      )}
    </div>
  );
};

export default MuralAvisos;