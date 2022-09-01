const { response } = require('express');
var express = require('express');
const session = require('express-session');
const userHelpers = require('../helpers/user-helpers');
var router = express.Router();
var userHelper =require('../helpers/user-helpers')


let userAuth=(req,res,next)=>{
  if(req.session.user){
    
    next()

  }else{

     res.redirect('/user_signin')
  }
}


/* GET users landingpage */
router.get('/',function(req, res, next) {
   let user=req.session.user
  console.log(user);
  res.render('index',{user}) 
});
// router.post('/',userAuth,function(req, res, next) {
//   let user=req.session.user
//   res.render('index')
// });




 /* ------------------------------ Get loginpage ----------------------------- */

router.get('/user_signin',function(req,res,next){
  if(req.session.LoggedIn){
    res.redirect('/')
  }else{

    res.render('user/user-signin',{loginErr:req.session.loginErr})
    req.session.loginErr=false
  }
})

 /* ------------------------------ Post loginPge ----------------------------- */

router.post('/user_signin',function(req,res,next){
  // console.log(req.body)
  userHelper.doLogin(req.body).then((response)=>{
    if(response.status){
      req.session.LoggedIn=true;
      req.session.user=response.user

      res.redirect('/')
    }else{
      req.session.loginErr=true;
      res.redirect('/user_signin')
    }
  })
  
})
// Get Signup page
router.get('/user_signup',function(req,res,next){
  if(req.session.LoggedIn){
    req.session.signErr=false
    res.redirect('/')
  }else{
    
    res.render('user/user-signin',{signErr:req.session.signErr})
    
  }

})

//  Post Signuppage
router.post('/user_signup',function(req,res,next){
   userHelper.dosignup(req.body).then((response)=>{
    if(response.status){
      req.session.signErr=true;
      res.redirect('/user_signin')
      console.log("sinerr");
    }else{
      res.redirect('/user_signin')

    }
   })


  
})

//  Get logout

router.get('/logout',(req,res,next)=>{
  req.session.destroy()
  // req.session.user=null
  // req.session.LoggedIn=null
 res.redirect('/')
})


// // view products

// router.get('/view_products',userAuth,(req,res,next)=>{
//   userHelpers.viewProd().then((data)=>{
//     res.render('user/user-viewproduct',{data})
//   })
  
// })


router.get('/show-allproducts',userAuth,async(req,res,next)=>{
  let user=req.session.user
  let cartCount=null
  if(req.session.user)
  {
    cartCount= await userHelpers.getCartCount(req.session.user._id)
  }
   
  userHelpers.getProducts().then((products)=>{
   userHelpers.getCategory().then((category)=>{
    res.render('user/user-viewproduct',{user,products,category,cartCount})
   }) 
    
  })

  router.get('/image_zoom',(req,res)=>{
    res.render('user/zoom-image')
  })
  // let catproducts=await userHelper.getProducts()
  // console.log(catproducts);
  // console.log();
  // res.render('user/user-viewproduct',{user:true})

})



// // otp
router.get('/otp',(req,res)=>{
  res.render('user/otp')
})
let signupData;
router.post('/otp',(req,res)=>{
  console.log('helloooooooooooo');
  
    userHelpers.doOTP(req.body).then((response)=>{
      console.log(response.status);
        if(response.status){
          console.log(response.user);
            signupData=response.user
            res.redirect('/confirmotp')
        }
        else{
            res.redirect('/otp')
        }
    })
})

router.get('/confirmotp',(req,res)=>{
  res.render('user/confirmotp')
})


router.post('/confirmotp',(req,res)=>{
  console.log("nnlasnclknlcn")
  console.log(req.body)
  console.log(signupData)
    userHelpers.doOTPconfirm(req.body,signupData).then((response)=>{
        if(response.status){
            console.log("bjkjbkjbxBKBJKXBkaBKXKKbjxkBkjsx")
            res.redirect('/')
        }
        else{
            res.redirect('/confirmotp')
        }
    })
})


router.get('/user-cart',userAuth,async(req,res)=>{
  let products= await userHelpers.getCartProducts(req.session.user._id)
  let totalValue=await userHelpers.getTotalAmount(req.session.user._id)
  res.render('user/user-cart',{products,'user':req.session.user._id,totalValue})
  console.log(products)

})

router.get('/add-to-cart/:id',(req,res)=>{
 userHelpers.addToCart(req.params.id,req.session.user._id).then(()=>{
  res.json({status:true})
  // res.redirect('/')
 })
})



router.post('/change-product-quantity',(req,res,next)=>{
  console.log("hi jio");
  console.log(req.body);
  userHelpers.changeProductQuantity(req.body).then(async(response)=>{
    response.total=await userHelpers.getTotalAmount(req.body.user)
    res.json(response)
  })
})

router.get('/place-order',userAuth,async(req,res,next)=>{
  let total=await userHelpers.getTotalAmount(req.session.user._id)
  let address=await userHelpers.getAddress(req.session.user._id)
  res.render('user/place-order',{user:true,total,user:req.session.user,address})
})


router.post('/place-order',userAuth,async(req,res)=>{
  let products=await userHelpers.getCartProductList(req.body.userId)
  let totalPrice=await userHelpers.getTotalAmount(req.body.userId)
  userHelpers.placeOrder(req.body,products,totalPrice).then((orderId)=>{
    if(req.body['payment-method']=='COD'){
      res.json({codSuccess:true})
    }else if(req.body['payment-method']=='ONLINE'){
     userHelpers.generateRazorPay(orderId,totalPrice).then((response)=>{
      console.log("response");
      console.log(response);
      console.log("response");
      console.log("cghjtedtew");
      response.razorPay=true;
     res.json(response)
     })
    }else if(req.body['payment-method']=='PAYPAL'){
      userHelpers.generatePayPal(orderId,totalPrice).then((response)=>{
        response.payPal=true;
        res.json(response)
      })
    }

  })
  console.log(req.body);
})


router.get('/order-success',(req,res)=>{
  res.render('user/order-success',{user:req.session.user})
})
router.get('/cancel',(req,res)=>{
  res.render('user/cancel-order',{user:req.session.user})
})

router.get('/orders',async(req,res)=>{
  let orders=await userHelpers.getUserOrders(req.session.user._id)
  res.render('user/orders',{user:req.session.user,orders})
})


router.get('/view-order-products/:id',async(req,res)=>{
  console.log('getorderproducts');
  let products=await userHelpers.getOrderProducts(req.params.id)
  console.log('orderd products are getted');
  console.log(products);
  res.render('user/view-order-products',{user:req.session.user,products,user:true})
})

router.get('/profile',userAuth,async(req,res)=>{
  let orders=await userHelpers.getUserOrders(req.session.user._id)
  let address=await userHelpers.getAddress(req.session.user._id)
  res.render('user/user-profile',{user:req.session.user,orders,address})
})


router.post('/verify-payment',(req,res)=>{
  console.log(req.body);
  userHelpers.verifyPayment(req.body).then(()=>{
    userHelpers.changePaymentStatus(req.body['order[receipt]']).then(()=>{
      console.log('payment success');
      res.json({status:true})
    }).catch((err)=>{
      res.json({status:false,errMsg:"payment failed"})
    })
  })
})


router.get('/add_address',userAuth,async(req,res)=>{
  res.render('user/add-address',{user:req.session.user})
})

// router.post('/add_address',userAuth,async(req,res)=>{
//   let address=await userHelpers.addAddress(req.session.user._id,req.body)
//   res.redirect('/profile')
// }).catch((err)=>{
//   console.log(err);
// })



router.post('/add_address',userAuth,async(req,res)=>{
  console.log('addresss');
  console.log(req.body);
  let address=await userHelpers.addAddress(req.session.user._id,req.body).then((response)=>{
    res.redirect('/profile')
  }).catch((err)=>{
    console.log(err);
  })
})

router.post('/edit_address',userAuth,(req,res)=>{
  let userId=req.body.user;
  let id=req.body.id
  console.log(id);
  console.log('Id');
  userHelpers.editAddress(req.body,userId,id).then((response)=>{
    res.redirect('/profile')
  }).catch((err)=>{
    console.log(err)
  })
})


router.get('/edit_address/:id',(req,res)=>{
  console.log('jcnkjadnckjndckjnakdjnckajdcnkjdncknkjscnkacksc')
  let id=req.params.id
  console.log(id);

 
  userHelpers.getEditAddress(id,req.session.user._id).then((address)=>{
    res.render('user/edit-address',{address})
  })
})
  


 router.get('/delete_address/:id',userAuth,(req,res)=>{
  console.log('delete address');
  let id=req.params.id
  console.log(id);
  console.log(id);
  userHelpers.deleteAddress(req.session.user._id,id).then((response)=>{
    // res.json(response)
    res.redirect('/profile')
  })
 })


 router.get('/add-wishlist/:id',userAuth,async(req,res)=>{
  let products=await userHelpers.addWishlist(req.session.user._id,req.params.id).then((response)=>{
    console.log(response.status);
  res.json(response )
  })
 })

 router.get('/wishlist',userAuth,async(req,res)=>{
  let product=await userHelpers.getWishProduct(req.session.user._id)
  let wishlist=await userHelpers.getwishlist(req.session.user.Id)
  if(wishlist){
    console.log('product already in wishlist');
  }
  else{
    console.log('added to wishlist')
  }
  console.log(product);
    res.render('user/wishlist',{'user':req.session.user._id,product}) 
  })
   
router.post('/cancel_order',async(req,res)=>{
 let corder=await userHelpers.cancelOrder(req.session.user._id)
  res.redirect('/profile')

})


router.get('/delete_cart',async(req,res)=>{
  let cart=await userHelpers.deleteCart(req.session.user._id).then((response)=>{
    // console.log(cart);
  })
})


module.exports = router;