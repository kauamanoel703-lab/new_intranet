const express = require("express");
const cors = require("cors");
require("dotenv").config();

const app = express();
const port = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

const usuarioRoutes = require("./src/routes/usuarioRoutes");
app.use("/api", usuarioRoutes);

app.get("/api/health", (req, res) => {
  res.json({ status: "OK", message: "Backend rodando com estrutura MVC!" });
});

app.listen(port, () => {
  console.log(`🚀 Backend rodando na porta ${port}`);
});
