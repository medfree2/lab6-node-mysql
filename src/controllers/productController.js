const service=require('../services/productService');
const handle=fn=>async(req,res,next)=>{try{await fn(req,res);}catch(e){next(e);}};
module.exports={
 getAll:handle(async(req,res)=>res.json(await service.listProducts())),
 getOne:handle(async(req,res)=>res.json(await service.getProduct(Number(req.params.id)))),
 create:handle(async(req,res)=>{const row=await service.createProduct(req.body);res.location('/api/products/'+row.id).status(201).json(row);}),
 update:handle(async(req,res)=>res.json(await service.updateProduct(Number(req.params.id),req.body))),
 remove:handle(async(req,res)=>{await service.deleteProduct(Number(req.params.id));res.status(204).send();}),
 search:handle(async(req,res)=>res.json(await service.search(req.query))),
 withCategory:handle(async(req,res)=>{const row=await service.createProductWithCategory(req.body,req.body.categoryName);res.location('/api/products/'+row.id).status(201).json(row);})
};
