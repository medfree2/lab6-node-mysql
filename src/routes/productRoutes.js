const router=require('express').Router(),c=require('../controllers/productController'),v=require('../middlewares/validation');
router.get('/search',v.searchRules,v.validate,c.search);
router.post('/with-category',v.transactionRules,v.validate,c.withCategory);
router.get('/',c.getAll);
router.get('/:id',v.idRules,v.validate,c.getOne);
router.post('/',v.productRules,v.validate,c.create);
router.put('/:id',v.idRules,v.productRules,v.validate,c.update);
router.delete('/:id',v.idRules,v.validate,c.remove);
module.exports=router;
