const express = require("express");
const cors = require("cors");
require("dotenv").config();

const app = express();
const port = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Importe as rotas APENAS UMA VEZ
const usuarioRoutes = require("./src/routes/usuarioRoutes");

// Rotas públicas (checagem de saúde do servidor)
app.get("/api/health", (req, res) => {
  res.json({ status: "OK", message: "Backend rodando com estrutura MVC!" });
});

// Configure o prefixo das rotas de usuário
app.use("/api/usuarios", usuarioRoutes);

// Inicie o servidor
app.listen(port, () => {
  console.log(`🚀 Backend rodando na porta ${port}`);
});