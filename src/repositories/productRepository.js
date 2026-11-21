const pool=require('../config/db');
const allowedSort=new Set(['id','name','price','category_id']);
function buildSearch(f={}){
 const {name,minPrice,maxPrice,categoryId,sort='name',order='asc'}=f;
 const limit=Number(f.limit??10),offset=Number(f.offset??((Number(f.page??1)-1)*limit));
 if(!allowedSort.has(sort)||!['asc','desc'].includes(String(order).toLowerCase()))throw Object.assign(new Error('Tri invalide'),{status:400});
 if(!Number.isSafeInteger(limit)||limit<1||limit>100||!Number.isSafeInteger(offset)||offset<0||offset>100000000)throw Object.assign(new Error('Pagination invalide'),{status:400});
 const where=[],params=[];
 if(name!==undefined){where.push('name LIKE ?');params.push('%'+name+'%');}
 if(minPrice!==undefined){where.push('price>=?');params.push(minPrice);}
 if(maxPrice!==undefined){where.push('price<=?');params.push(maxPrice);}
 if(categoryId!==undefined){where.push('category_id=?');params.push(categoryId);}
 const clause=where.length?' WHERE '+where.join(' AND '):'';
 // Colonnes et sens de tri strictement contrôlés ; limites converties en entiers bornés.
 const direction=String(order).toUpperCase(),sortSql=sort==='id'?`id ${direction}`:`${sort} ${direction}, id ASC`;
 return{clause,params,sql:`SELECT * FROM products${clause} ORDER BY ${sortSql} LIMIT ${limit} OFFSET ${offset}`,limit,offset};
}
module.exports={buildSearch,
 getAll:async()=>{const[rows]=await pool.execute('SELECT * FROM products ORDER BY id');return rows;},
 getById:async(id,db=pool)=>{const[rows]=await db.execute('SELECT * FROM products WHERE id=?',[id]);return rows[0];},
 create:async(data,db=pool)=>{const[r]=await db.execute('INSERT INTO products(name,price,category_id) VALUES (?,?,?)',[data.name,data.price,data.category_id??null]);return module.exports.getById(r.insertId,db);},
 update:async(id,data)=>{await pool.execute('UPDATE products SET name=?,price=?,category_id=? WHERE id=?',[data.name,data.price,data.category_id??null,id]);return module.exports.getById(id);},
 remove:async id=>pool.execute('DELETE FROM products WHERE id=?',[id]),
 search:async f=>{const q=buildSearch(f);const[rows]=await pool.execute(q.sql,q.params);const[[count]]=await pool.execute('SELECT COUNT(*) AS total FROM products'+q.clause,q.params);return{data:rows,total:count.total,limit:q.limit,offset:q.offset};}
};
