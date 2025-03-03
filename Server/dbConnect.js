import pgPkg from 'pg';
const {Pool}=pgPkg;
const pool = new Pool({
    host: "localhost",
    user: "postgres",
    password: "1234",
    port: "5432",
    database: "reactPersona"
})

pool.connect().then(() => {
    console.log("Connected to Postgres Database")
}).catch((err) => {
    console.log("Error connecting to the database:", err)
})

export default pool;