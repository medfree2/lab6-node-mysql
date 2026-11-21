const pool=require('../config/db');
module.exports={
 getAll:async()=>{const[rows]=await pool.execute('SELECT * FROM categories ORDER BY id');return rows;},
 getById:async(id,db=pool)=>{const[rows]=await db.execute('SELECT * FROM categories WHERE id=?',[id]);return rows[0];},
 create:async(data,db=pool)=>{const[r]=await db.execute('INSERT INTO categories(name) VALUES (?)',[data.name]);return{id:r.insertId,name:data.name};},
 update:async(id,data)=>{await pool.execute('UPDATE categories SET name=? WHERE id=?',[data.name,id]);return{id,name:data.name};},
 remove:async(id,db=pool)=>db.execute('DELETE FROM categories WHERE id=?',[id])
};
