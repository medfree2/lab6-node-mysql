const repo=require('../repositories/categoryRepository'),pool=require('../config/db');
const fail=(message,status)=>Object.assign(new Error(message),{status});
module.exports={
 listCategories:()=>repo.getAll(),
 getCategory:async id=>{const row=await repo.getById(id);if(!row)throw fail('Category not found',404);return row;},
 createCategory:data=>repo.create({name:data.name}),
 updateCategory:async(id,data)=>{await module.exports.getCategory(id);return repo.update(id,{name:data.name});},
 deleteCategory:async id=>{
  const c=await pool.getConnection();
  try{await c.beginTransaction();
   const[categories]=await c.execute('SELECT id FROM categories WHERE id=? FOR UPDATE',[id]);
   if(!categories.length)throw fail('Category not found',404);
   const[linked]=await c.execute('SELECT id FROM products WHERE category_id=? LIMIT 1 FOR UPDATE',[id]);
   if(linked.length)throw fail('Cannot delete category with linked products',409);
   await repo.remove(id,c);await c.commit();
  }catch(e){await c.rollback();throw e;}finally{c.release();}
 }
};
