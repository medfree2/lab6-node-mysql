const repo=require('../repositories/productRepository'),categories=require('../repositories/categoryRepository'),pool=require('../config/db');
const fail=(message,status)=>Object.assign(new Error(message),{status});
const dataOf=d=>({name:d.name,price:d.price,category_id:d.category_id??null});
async function checkCategory(id){if(id!==null&&id!==undefined&&!await categories.getById(id))throw fail('Invalid category_id',400);}
module.exports={
 listProducts:()=>repo.getAll(),
 getProduct:async id=>{const row=await repo.getById(id);if(!row)throw fail('Product not found',404);return row;},
 createProduct:async d=>{await checkCategory(d.category_id);return repo.create(dataOf(d));},
 updateProduct:async(id,d)=>{await module.exports.getProduct(id);await checkCategory(d.category_id);return repo.update(id,dataOf(d));},
 deleteProduct:async id=>{await module.exports.getProduct(id);await repo.remove(id);},
 search:async f=>{if(f.minPrice!==undefined&&f.maxPrice!==undefined&&Number(f.minPrice)>Number(f.maxPrice))throw fail('minPrice doit être inférieur à maxPrice',400);return repo.search(f);},
 createProductWithCategory:async(product,categoryName)=>{
  const c=await pool.getConnection();
  try{await c.beginTransaction();
   // MySQL arbitre l'unicité même lors de créations simultanées.
   const[cat]=await c.execute('INSERT INTO categories(name) VALUES (?) ON DUPLICATE KEY UPDATE id=LAST_INSERT_ID(id)',[categoryName]);
   const created=await repo.create({...dataOf(product),category_id:cat.insertId},c);
   await c.commit();return created;
  }catch(e){await c.rollback();throw e;}finally{c.release();}
 }
};
