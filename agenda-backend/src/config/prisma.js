// Configura y exporta una única instancia de Prisma Client para que
// todos los controladores la reutilicen al hablar con la base de datos.

// Carga las variables definidas en el archivo .env (como DATABASE_URL)
// dentro de process.env, para no escribir credenciales en el código.
require("dotenv").config();
const { PrismaClient } = require("@prisma/client");
const { PrismaMariaDb } = require("@prisma/adapter-mariadb");

// Adaptador que le indica a Prisma cómo conectarse a MariaDB/MySQL,
// usando la cadena de conexión definida en la variable DATABASE_URL.
const adapter = new PrismaMariaDb(process.env.DATABASE_URL);

// Cliente de Prisma: expone métodos como prisma.contacto.findMany(),
// .create(), .update(), .delete()... generados a partir de schema.prisma.
const prisma = new PrismaClient({ adapter });

// Se exporta la instancia ya configurada para no crear una nueva
// conexión en cada archivo que necesite acceder a la base de datos.
module.exports = prisma;
