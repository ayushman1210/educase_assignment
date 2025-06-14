const express=require('express')
const router=express.Router();
const {addschool,schoollist}=require('../controller/school')

router.post('/addschool',addschool);
router.get('/listschool',schoollist)


module.exports=router;