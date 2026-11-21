const {test,before,after}=require('node:test'),assert=require('node:assert/strict');
const {createApp}=require('../src/app'),pool=require('../src/config/db'),service=require('../src/services/productService');
let server,base;const prefix='LAB6TEST_'+Date.now();const owned=[];let category,product;
before(async()=>{await pool.execute('SELECT 1');server=createApp().listen(0,'127.0.0.1');await new Promise(r=>server.once('listening',r));base='http://127.0.0.1:'+server.address().port;});
after(async()=>{for(const id of owned)await pool.execute('DELETE FROM products WHERE id=?',[id]);await pool.execute('DELETE FROM categories WHERE name LIKE ?',[prefix+'%']);if(server)await new Promise(r=>server.close(r));await pool.end();});
async function req(path,method='GET',body){const r=await fetch(base+path,{method,headers:body===undefined?{}:{'Content-Type':'application/json'},body:body===undefined?undefined:JSON.stringify(body)});return{status:r.status,body:r.status===204?null:await r.json()};}
test('Connexion réelle et version MySQL',async()=>{const[[r]]=await pool.execute('SELECT VERSION() AS version');assert.match(r.version,/^8\./);console.log('MySQL réel :',r.version);});
test('CRUD catégories et produits, DECIMAL précis',async()=>{
 let r=await req('/api/categories','POST',{name:prefix+'Audio'});assert.equal(r.status,201);category=r.body.id;
 r=await req('/api/products','POST',{name:prefix+'Casque',price:59.99,category_id:category});assert.equal(r.status,201);product=r.body.id;owned.push(product);assert.equal(r.body.price,'59.99');
 assert.equal((await req('/api/products/'+product)).body.category_id,category);
 r=await req('/api/products/'+product,'PUT',{name:prefix+'Casque Pro',price:79.95,category_id:category});assert.equal(r.status,200);assert.equal(r.body.price,'79.95');
 assert.equal((await req('/api/categories/'+category,'PUT',{name:prefix+'Audio Pro'})).status,200);
});
test('Catégorie liée bloquée, doublon détecté',async()=>{
 assert.equal((await req('/api/categories/'+category,'DELETE')).status,409);
 assert.equal((await req('/api/categories','POST',{name:prefix+'Audio Pro'})).status,409);
});
test('Recherche, tri, pagination et injection rejetée',async()=>{
 let r=await req('/api/products/search?name='+prefix+'&minPrice=0&maxPrice=100&categoryId='+category+'&page=1&limit=1&sort=price&order=desc');assert.equal(r.status,200);assert.equal(r.body.total,1);assert.equal(r.body.data[0].id,product);
 assert.equal((await req('/api/products/search?name='+encodeURIComponent("' OR 1=1 --"))).body.total,0);
 assert.equal((await req('/api/products/search?sort='+encodeURIComponent('price; DROP TABLE products'))).status,400);
 assert.equal((await req('/api/products/search?minPrice=10&maxPrice=0')).status,400);
 assert.equal((await req('/api/products/search?maxPrice=0')).body.total,0);
});
test('Validation et erreurs 400/404, catégorie absente',async()=>{
 for(const data of [{name:'x',price:1},{name:'Valide',price:0},{name:'Valide',price:1.001},{name:'Valide',price:1,category_id:2147483647}])assert.equal((await req('/api/products','POST',data)).status,400);
 assert.equal((await req('/api/products/1abc')).status,400);assert.equal((await req('/api/products/2147483647')).status,404);assert.equal((await req('/inconnue')).status,404);
 const r=await fetch(base+'/api/products',{method:'POST',headers:{'Content-Type':'application/json'},body:'{'});assert.equal(r.status,400);
});
test('Transaction commit et catégorie réutilisée simultanément',async()=>{
 const results=await Promise.all([1,2].map(n=>req('/api/products/with-category','POST',{name:prefix+'Transaction '+n,price:10.50,categoryName:prefix+'Transaction'})));
 for(const r of results){assert.equal(r.status,201);owned.push(r.body.id);}
 assert.equal(results[0].body.category_id,results[1].body.category_id);
 const[[count]]=await pool.execute('SELECT COUNT(*) AS n FROM categories WHERE name=?',[prefix+'Transaction']);assert.equal(count.n,1);
});
test('Rollback réel : catégorie annulée après échec SQL du produit',async()=>{
 await assert.rejects(service.createProductWithCategory({name:prefix+'Rollback',price:0},prefix+'Rollback'));
 const[rows]=await pool.execute('SELECT id FROM categories WHERE name=?',[prefix+'Rollback']);assert.equal(rows.length,0);
 // Une connexion libérée reste utilisable après rollback.
 const[[ok]]=await pool.execute('SELECT 1 AS ok');assert.equal(ok.ok,1);
});
test('Persistance après redémarrage HTTP puis suppression 204',async()=>{
 await new Promise(r=>server.close(r));server=createApp().listen(0,'127.0.0.1');await new Promise(r=>server.once('listening',r));base='http://127.0.0.1:'+server.address().port;
 assert.equal((await req('/api/products/'+product)).body.id,product);
 assert.equal((await req('/api/products/'+product,'DELETE')).status,204);
 assert.equal((await req('/api/products/'+product)).status,404);
 assert.equal((await req('/api/categories/'+category,'DELETE')).status,204);
});
