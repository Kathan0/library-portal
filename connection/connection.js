import { createRequire } from "module";
const require = createRequire(import.meta.url);
const mysql = require('mysql');

export const connection = mysql.createConnection({
    host: "127.0.0.1",
    user: "root",
    password: "12345678",
    multipleStatements: true
});