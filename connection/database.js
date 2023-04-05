import { createRequire } from "module";
const require = createRequire(import.meta.url);
import { connection } from "./connection.js";
import { exit } from "process";
const fs = require('fs');

console.log('\n\tThis will take a while. Please relax :)\n');
const dataSql = fs.readFileSync('./127_0_0_1.sql').toString();
connection.query(dataSql, (err, res)=>{
    if(err) throw err;
    console.log(`   ____      ______     __      __ __________`);
    console.log(` /|___ \\    / ____ \\   |   \\   | | | |_______|`);
    console.log(`| |   \\ \\  / /    \\ \\  | |\\ \\  | | | |`);
    console.log(`| |    \\ \\ | |     | | | | \\ \\ | | | |_______`);
    console.log(`| |    / / | |     | | | |  \\ \\| | | |_______|`);
    console.log(`| |   / /  \\ \\     / / | |   \\   | | |`);
    console.log(`| |__/ /    \\ \\___/ /  | |    \\  | | |_______`);
    console.log(`|/____/      \\\_____/   |_|     \\\_| |_|_______|`);
    exit();
})
