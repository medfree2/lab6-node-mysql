require('dotenv').config({quiet:true});
const mysql=require('mysql2/promise');
module.exports=mysql.createPool({host:process.env.DB_HOST||'127.0.0.1',port:Number(process.env.DB_PORT||3306),
 user:process.env.DB_USER||'lab_user',password:process.env.DB_PASSWORD,database:process.env.DB_NAME||'lab_product',
 waitForConnections:true,connectionLimit:10,queueLimit:100,charset:'utf8mb4',multipleStatements:false});
