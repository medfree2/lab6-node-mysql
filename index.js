require('dotenv').config({quiet:true});
const pool=require('./src/config/db'),{createApp}=require('./src/app');
async function start(){
 await pool.execute('SELECT 1');
 const port=Number(process.env.PORT||3006);
 const server=createApp().listen(port,()=>console.log(`LAB 6 — Express/MySQL — http://localhost:${port}/api-docs/`));
 for(const signal of ['SIGINT','SIGTERM'])process.once(signal,()=>server.close(async()=>{await pool.end();}));
 server.on('error',async e=>{console.error(e.message);await pool.end();process.exitCode=1;});
}
start().catch(async e=>{console.error('Connexion MySQL impossible :',e.code||e.message);await pool.end();process.exitCode=1;});
