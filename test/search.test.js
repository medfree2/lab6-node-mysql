const {test}=require('node:test'),assert=require('node:assert/strict');
const repo=require('../src/repositories/productRepository'),pool=require('../src/config/db');
test('Tri et pagination non autorisés rejetés avant SQL',()=>{
 for(const f of [{sort:'name; DROP TABLE products'},{order:'desc;--'},{limit:'1 OR 1=1'},{offset:-1}])assert.throws(()=>repo.buildSearch(f));
});
test('Filtres paramétrés et borne zéro conservée',()=>{
 const q=repo.buildSearch({name:"' OR 1=1 --",maxPrice:0,limit:2,page:2,sort:'price',order:'desc'});
 assert.ok(!q.sql.includes("' OR"));assert.deepEqual(q.params,["%' OR 1=1 --%",0]);assert.equal(q.offset,2);
});
require('node:test').after(()=>pool.end());
