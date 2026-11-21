const service=require('../services/categoryService');
const handle=fn=>async(req,res,next)=>{try{await fn(req,res);}catch(e){next(e);}};
module.exports={
 getAll:handle(async(req,res)=>res.json(await service.listCategories())),
 getOne:handle(async(req,res)=>res.json(await service.getCategory(Number(req.params.id)))),
 create:handle(async(req,res)=>{const row=await service.createCategory(req.body);res.location('/api/categories/'+row.id).status(201).json(row);}),
 update:handle(async(req,res)=>res.json(await service.updateCategory(Number(req.params.id),req.body))),
 remove:handle(async(req,res)=>{await service.deleteCategory(Number(req.params.id));res.status(204).send();})
};
