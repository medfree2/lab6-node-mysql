module.exports=(err,req,res,next)=>{
 if(res.headersSent)return next(err);
 let status=err.status||500,message=err.message;
 if(err.code==='ER_DUP_ENTRY'){status=409;message='Cette catégorie existe déjà';}
 if(err.code==='ER_NO_REFERENCED_ROW_2'){status=400;message='Catégorie inexistante';}
 if(err.type==='entity.parse.failed'){status=400;message='JSON invalide';}
 if(status>=500){console.error(err.code||err.message);message='Erreur interne du serveur';}
 res.status(status).json({error:message});
};
