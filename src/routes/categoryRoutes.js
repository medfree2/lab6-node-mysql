const router=require('express').Router(),c=require('../controllers/categoryController'),v=require('../middlewares/validation');
router.get('/',c.getAll);
router.get('/:id',v.idRules,v.validate,c.getOne);
router.post('/',v.categoryRules,v.validate,c.create);
router.put('/:id',v.idRules,v.categoryRules,v.validate,c.update);
router.delete('/:id',v.idRules,v.validate,c.remove);
module.exports=router;
