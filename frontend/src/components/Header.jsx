const Header = () => {
  // Busca o objeto do usuário no localStorage
  const usuarioString = localStorage.getItem('usuario');
  const usuario = usuarioString ? JSON.parse(usuarioString) : null;

  return (
    <header style={{ padding: '20px', background: '#333', color: '#fff', marginBottom: '20px', borderRadius: '8px' }}>
      <h1>Bem-vindo, {usuario ? usuario.nome : 'Visitante'}!</h1>
      <p>Este é o seu painel de controle da Intranet JUCEPE.</p>
    </header>
  );
};

export default Header;