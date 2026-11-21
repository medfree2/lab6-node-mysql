const express=require('express'),swaggerUi=require('swagger-ui-express');
const spec=require('../docs/openapi.json');
function createApp(){
 const app=express();app.disable('x-powered-by');app.use(express.json({limit:'100kb'}));
 app.get('/',(req,res)=>res.json({lab:6,message:'API Produits — MySQL / async-await'}));
 app.use('/api/products',require('./routes/productRoutes'));
 app.use('/api/categories',require('./routes/categoryRoutes'));
 app.get('/api-docs.json',(req,res)=>res.json(spec));
 app.use('/api-docs',swaggerUi.serve,swaggerUi.setup(spec));
 app.use((req,res)=>res.status(404).json({error:'Route non trouvée'}));
 app.use(require('./middlewares/errorHandler'));return app;
}
module.exports={createApp};
