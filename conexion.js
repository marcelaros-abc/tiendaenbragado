// importar el módulo mysql
const mysql = require("mysql2/promise");

// crear la conexión con los datos correctos
const conexion = mysql.createPool({ host: process.env.DB_HOST || "localhost", 
  port: process.env.DB_PORT, 
  user: process.env.DB_USER, 
  password: process.env.DB_PASSWORD, 
  database: process.env.DB_NAME, 
  ssl: process.env.DB_SSL === "true" ? { minVersion: "TLSv1.2" } : undefined, 
  enableKeepAlive: true 
});

// exportar la conexión
module.exports = conexion;
