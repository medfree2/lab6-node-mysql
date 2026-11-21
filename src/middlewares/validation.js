const {body,param,query,validationResult}=require('express-validator');
const baseProductRules=()=>[
 body('name').isString().bail().trim().isLength({min:3,max:150}).withMessage('Nom : 3 à 150 caractères'),
 body('price').isFloat({gt:0,max:99999999.99}).bail().custom(v=>/^\d+(?:\.\d{1,2})?$/.test(String(v))).withMessage('Prix positif avec 2 décimales maximum')
];
const productRules=[...baseProductRules(),body('category_id').optional({nullable:true}).isInt({min:1,max:2147483647}).bail().toInt()];
const categoryRules=[body('name').isString().bail().trim().isLength({min:2,max:100})];
const transactionRules=[...baseProductRules(),body('categoryName').isString().bail().trim().isLength({min:2,max:100})];
const idRules=[param('id').isInt({min:1,max:2147483647}).withMessage('Identifiant invalide').bail().toInt()];
const searchRules=[
 query('name').optional().isString().bail().isLength({max:150}),
 ...['minPrice','maxPrice'].map(k=>query(k).optional().isFloat({min:0,max:99999999.99}).bail().toFloat()),
 query('categoryId').optional().isInt({min:1,max:2147483647}).bail().toInt(),
 query('page').optional().isInt({min:1,max:1000000}).bail().toInt(),
 query('limit').optional().isInt({min:1,max:100}).bail().toInt(),
 query('offset').optional().isInt({min:0,max:100000000}).bail().toInt(),
 query('sort').optional().isIn(['id','name','price','category_id']),
 query('order').optional().isIn(['asc','desc','ASC','DESC'])
];
function validate(req,res,next){const errors=validationResult(req);if(!errors.isEmpty())return res.status(400).json({errors:errors.array()});next();}
module.exports={productRules,categoryRules,transactionRules,idRules,searchRules,validate};
