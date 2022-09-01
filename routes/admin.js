const { response } = require('express');
var express = require('express');
var router = express.Router();
var adminHelper =require('../helpers/admin-helpers');
const userHelpers = require('../helpers/user-helpers');
var upload=require('../multer/multer')
var ObjectID=require('mongodb').ObjectId

let userName = "kousallya@gmail.com"
let Pin = "12345"

const adminVerify= (req,res,next)=>{

  if(req.session.admin){
    next()
  } else{

    res.redirect('/admin/admin_login')
  }

}

/* GET home page. */
router.get('/',adminVerify, function(req, res, next) {
  res.render('admin/admin-panel', {admin:true});
});

// Get admin login
router.get('/admin_login',function(req,res,next){
  res.render('admin/admin-login',{admin:true})
})

// Post admin login

router.post('/admin_login',(req,res)=>{
    const { email, password } = req.body;
    console.log(req.body)
    if (userName === email && Pin === password) {
      // req.session.check = true;
      req.session.admin = true;
      res.redirect('/admin')
      
    }
    else {
      req.session.err="incorrect username or password"
      res.redirect('admin/admin_login',{alertLogin : 'Incorrect credentials'})
    }
  })

  // view users

  router.get('/view_users',adminVerify,function(req,res){
     adminHelper.viewUsers().then((data)=>{
      console.log(data)
      res.render('admin/list-user',{data})
  
     })

  // block users
  router.get('/block/:id',function(req,res){
      
      //  console.log(proId)
      adminHelper.blockUser(req.params.id).then((data)=>{
        res.redirect('/admin/view_users')
      })
  }),

   // unblock users
   router.get('/unblock/:id',function(req,res){
    // let proId=req.params.id
    // console.log(proId)
   adminHelper.unblockUser(req.params.id).then((data)=>{
     res.redirect('/admin/view_users')
   })
})
  

  })

  //get add main category



  router.get('/add_banner',function(req,res){
    adminHelper.getBannerDetails().then((data)=>{
      console.log(data)
      res.render('admin/admin-addbanner',{data})
    })
  })


    
router.get('/add_product',function(req,res){
  res.render('admin/admin-addproduct')
})


router.post('/add_product',(req,res)=>{
  console.log("jjjjjjjjj")
  adminHelper.addProduct(req.body,(id)=>{
    let image=req.files.Image
    image.mv('./public/product-images/'+id+'.jpg',(err)=>{
      // C:\Users\HP\Desktop\Wardrobe\public\product-images
      if(!err){
        res.redirect('/admin/view_product')
      }else{
        console.log(err);
      }
    })
  })
})


  router.get('/add_category',(req,res)=>{
    res.render('admin/admin-addcategory',{message:req.session.message, admin:true})
  req.session.message=null
   })

   router.get('/category',adminVerify,function(req,res){
   adminHelper.getAllCategory().then((category)=>{
     console.log(category)
      res.render('admin/admin-viewcategory',{category,admin:true})
    })
  })

  router.post('/add_category',(req,res)=>{
    console.log('category added');
    adminHelper.checkCategory(req.body).then((response) => {
     console.log("category nvjnjv");
     console.log(response);
      if (response.status) {
        req.session.message = "Category already existed";
        res.redirect("/admin/add_category");
      } else {
      adminHelper.addCategory(req.body,(id)=>{
        console.log(id)
         res.redirect("/admin/category")
      
        })
      }
      
       })
      })







  router.post('/add_banner',function(req,res){
    
    adminHelper.addBanner(req.body,(id)=>{
     
     // console.log(response);
      let image=req.files.bannerImage
      image.mv('./public/banner-images/'+id+'.jpg',(err)=>{
        if(!err){
          res.redirect('/admin/view_banner')
        }else{
          console.log(err);
        }
      
    })
  })
})

      
      // view products

      router.get('/view_product',adminVerify,(req,res)=>{
        adminHelper.viewProducts().then((data)=>{

          res.render('admin/admin-viewproduct',{admin:true,data})
        })
          
      })
      router.get('/view_category',adminVerify,(req,res)=>{
        adminHelper.viewCategory().then((category)=>{

          res.render('admin/admin-viewcategory',{category,admin:true})
        })
          
      })
      router.get('/view_banner',(req,res)=>{
        adminHelper.viewBanner().then((banner)=>{

          res.render('admin/admin-viewbanner',{banner,admin:true})
        })
          
      })

    router.get('/aside',(req,res)=>{
      res.render('partials/admin-aside',{admin:true})
    })
     


    router.get('/edit_product/:id',async(req,res)=>{
      console.log('vgvgfcgfggc');
      console.log(req.params.id);
      let product= await adminHelper.getProductDetails(req.params.id)
      console.log(product)
      res.render('admin/admin-editproduct',{product})
    })
    router.get('/edit_category/:id',async(req,res)=>{
      console.log('vgvgfcgfggc');
      console.log(req.params.id);
      let category= await adminHelper.getCategory(req.params.id)
      console.log(category)
      res.render('admin/admin-editcategory',{category})
    })

    router.get('/edit_banner/:id',async(req,res)=>{
      console.log('vgvgfcgfggc');
      console.log(req.params.id);
      let banner= await adminHelper.getBannerDetails(req.params.id)
      console.log(banner)
      res.render('admin/admin-editbanner',{banner})
    })

  router.post('/edit_product/:id',async(req,res)=>{
    console.log('hello')
    let id=req.params.id
    adminHelper.updateProduct(req.params.id,req.body).then(()=>{
      res.redirect('/admin/view_product')
      if(req.files.Image){
        let image=req.files.Image
        image.mv('./public/product-images/'+id+'.jpg')
      }
    })
  })
  router.post('/edit_category/:id',async(req,res)=>{
    console.log('hello')
    let id=req.params.id
    adminHelper.updateCategory(req.params.id,req.body).then(()=>{
      res.redirect('/admin/view_category')
      if(req.files.categoryImage){
        let image=req.files.categoryImage
        image.mv('./public/category-images/'+id+'.jpg')
      }
    })
  })
  router.post('/edit_banner/:id',async(req,res)=>{
    console.log('hello')
    let id=req.params.id
    adminHelper.updateBanner(req.params.id,req.body).then(()=>{
      res.redirect('/admin/view_banner')
      if(req.files.bannerImage){
        let image=req.files.bannerImage
        console.log(image);
        image.mv('./public/banner-images/'+id+'.jpg')
      }
    })
  })
    router.get('/delete_product/:id',(req,res)=>{
      let proID = req.params.id;
      console.log(proID);
      adminHelper.deleteProduct(proID).then((data)=>{

        res.redirect('/admin/view_product')
        
      })

    })
    router.get('/delete_category/:id',(req,res)=>{
      let proID = req.params.id;
      console.log(proID);
      adminHelper.deleteCategory(proID).then((data)=>{

        res.redirect('/admin/view_category')
        
      })

    })
    router.get('/delete_banner/:id',(req,res)=>{
      let bannerID = req.params.id;
      console.log(bannerID);
      adminHelper.deleteBanner(bannerID).then((data)=>{

        res.redirect('/admin/view_banner')
        
      })

    })


    router.get('/view_order',async(req,res)=>{
      await adminHelper.getUserOrders().then((orders)=>{
        console.log(orders)
        res.render('admin/admin-vieworder',{orders})
      })
      
    })


    router.get('/donut_chart',async(req,res)=>{
      let chart= await adminHelper.getDonutChart()
      let year=await adminHelper.getLineChart()
      let stat=await adminHelper.getBarChart()
        res.render('admin/donut',{chart,year,stat})
      })
     


module.exports = router;
