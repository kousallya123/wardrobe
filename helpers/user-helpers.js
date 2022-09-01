var db = require('../config/connection')
var collection = require('../config/collections')
var bcrypt = require('bcrypt')
// const { USERSCOLLECTION } = require('../config/collections')
// const { response } = require('express')
const { ObjectId } = require('mongodb')
const otp=require('../config/otp')
const client=require('twilio')(otp.accountSID,otp.authToken)
const Razorpay = require('razorpay');
const paypal = require('paypal-rest-sdk');
const moment=require('moment')

var instance = new Razorpay({
  key_id: process.env.KEY_ID,
  key_secret: process.env.KEY_SECRET,
});


paypal.configure({
    'mode': 'sandbox', //sandbox or live
    'client_id': process.env.CLIENT_ID,
    'client_secret': process.env.CLIENT_SECRET
  });


module.exports = {
    dosignup: (userData) => {

        let response = {}
        return new Promise(async(resolve, reject) => {
            let email = await db.get().collection(collection.USERSCOLLECTION).findOne({ email: userData.email })

            if (email) {
                response.status = true;
                console.log(response);
                resolve(response)

            } else {

                userData.password = await bcrypt.hash(userData.password, 10)
                userData.state=true;
                db.get().collection(collection.USERSCOLLECTION).insertOne(userData).then((data) => {
                    resolve(data.insertedId)

                })
                resolve({ status: false })


            }
        })



    },

    doLogin: (userData) => {
        return new Promise(async (resolve, reject) => {
            let loginStatus = false
            let response = {}
            let user = await db.get().collection(collection.USERSCOLLECTION).findOne({ email: userData.email })
            // let check = await db.get().collection(collection.USERSCOLLECTION).findOne({ state: true })

           if(user.state==true){
            resolve({status :false})
           }
            else{
            if (user) {
                
                console.log(user);
                bcrypt.compare(userData.Password, user.password).then((status) => {
                    console.log(status);
                    if (status) {
                        console.log("login sucess")
                        response.user = user;
                        // response.user.status=true
                        response.status = true;
                        resolve(response)
                    }
                    else {
                        console.log("login failed")
                        resolve({ status: false });
                    }
                })
            } else {
                console.log("user not found")
                resolve({status :false})
            }
        }
        })
    },

    // viewProd :()=>{
    //     return new Promise (async(resolve,reject)=>{
    //         await db.get().collection(collection.PRODUCT).find().toArray().then((data)=>{
    //             resolve(data)
    //             console.log(data)
    //         })

    //     })
    // },
    getProducts:()=>{
        return new Promise(async(resolve,reject)=>{
        let products=await db.get().collection(collection.PRODUCT).find().toArray()
        resolve(products)
        })
    },
    getBanner:()=>{
        return new Promise(async(resolve,reject)=>{
        let banner=await db.get().collection(collection.BANNER).find().toArray()
        resolve(banner)
        })
    },
    getCategory:()=>{
        return new Promise(async(resolve,reject)=>{
        let category=await db.get().collection(collection.CATEGORY).find().toArray()
        resolve(category)
        })
    },
    doOTP:(userData) =>{
        let response={}
        return new Promise(async(resolve,reject)=>{
            let user= await db.get().collection(collection.USERSCOLLECTION).findOne({ phone: userData.phone })
        
            if(user){
                response.status= true
                response.user=user
                  client.verify.services(otp.serviceId)
                    .verifications
                    .create({to: `+91${userData.phone}`, channel: 'sms'})
                    .then((verification) =>{
    
                    });   
                    console.log(response);
                    resolve(response)
    
            }
            else{
                response.status=false;
                resolve(response)
               
    
    
            }
        })
    },
    
doOTPconfirm:(confirmOtp,userData)=>{
    console.log('hello0000000000');
    console.log(userData);
    console.log(confirmOtp);

    return new Promise((resolve,reject)=>

    {

        client.verify.services(otp.serviceId)
        .verificationChecks
        .create({
            to: `+91${userData.phone}`,
             code: confirmOtp.phone
            })
        .then((data) => {
            if(data.status == 'approved'){
                console.log(data,"hggg");
                resolve({status:true})
            }
            else {
                console.log(data,"hnjvkjfdsncknsncndjc");
                resolve({status:false})
            }

        })

    })
    
},
    addToCart:(proId,userId)=>{
        let proObj={
            Item:ObjectId(proId),
            quantity:1
        }
        return new Promise(async(resolve,reject)=>{
        let userCart=await db.get().collection(collection.CART_COLLECTION).findOne({user:ObjectId(userId)})
        if(userCart){
            let proExist=userCart.products.findIndex(products=> products.Item==proId)
            console.log(proExist);
            
            if(proExist!=-1){
                db.get().collection(collection.CART_COLLECTION)
                .updateOne({user:ObjectId(userId),'products.Item':ObjectId(proId)},
                {
                    $inc:{'products.$.quantity':1}
                }).then(()=>{
                    resolve()
                })
            }else{ 
            db.get().collection(collection.CART_COLLECTION)
            .updateOne({user:ObjectId(userId)},
            {
               
                    $push:{products:proObj}
                
            }).then((response)=>{
                resolve()
            })
        }

        }else{
            let cartObj={
                user:ObjectId(userId),
                products:[proObj]
            }
            db.get().collection(collection.CART_COLLECTION).insertOne(cartObj).then((response)=>{
                resolve(response)
            })
        }

        })
        },
        getCartProducts:(userId)=>{
            return new Promise(async(resolve,reject)=>{
                let cartItems=await db.get().collection(collection.CART_COLLECTION).aggregate([
                    {
                        $match:{user:ObjectId(userId)}
                    },
                    {
                        $unwind:"$products"
                    },
                    {
                      $project:{
                        Item:'$products.Item',
                        quantity:'$products.quantity'
                      }
                    },
                    {
                        $lookup:{
                            from:collection.PRODUCT,
                            localField:'Item',
                            foreignField:'_id',
                            as:'product'
                        }
                    },{
                        $project:{
                            Item:1,quantity:1,product:{$arrayElemAt:['$product',0]}
                        }
                    }
                    
                ]).toArray()
                console.log(cartItems)
                resolve(cartItems)
            })
        },
         getCartCount:(userId)=>{
            return new Promise(async(resolve,reject)=>{
                let count=0;
                let cart=await db.get().collection(collection.CART_COLLECTION).findOne({user:ObjectId(userId)})
                if(cart){
                    count=cart.products.length
                    resolve(count)
                }else{
                resolve(count)
                }
            })
        },
        changeProductQuantity:(details)=>{
            details.count=parseInt(details.count)
            details.quantity=parseInt(details.quantity)
            console.log("mbhghadcsjh");
            console.log(details);
            return new Promise((resolve,reject)=>{

                if(details.count==-1 && details.quantity==1){

                    db.get().collection(collection.CART_COLLECTION)
                    .updateOne({_id:ObjectId(details.cart)},
                    {
                        $pull:{products:{Item:ObjectId(details.product)}}
                    }
                ).then((response)=>{

                        resolve({removeProduct:true})
                    })

                }
                else{
                db.get().collection(collection.CART_COLLECTION)
                .updateOne({_id:ObjectId(details.cart),'products.Item':ObjectId(details.product)},
                {
                    $inc:{'products.$.quantity':details.count}
                }
                ).then((response)=>{
                    resolve({status:true})
                }) 
            }  
            })
        },
        getTotalAmount:(userId)=>{
            console.log("gvbvb");
            console.log(userId);
            return new Promise(async(resolve,reject)=>{
                let total=await db.get().collection(collection.CART_COLLECTION).aggregate([
                    {
                        $match:{user:ObjectId(userId)}
                    },
                    {
                        $unwind:"$products"
                    },
                    {
                      $project:{
                        Item:'$products.Item',
                        quantity:'$products.quantity'
                      }
                    },
                    {
                        $lookup:{
                            from:collection.PRODUCT,
                            localField:'Item',
                            foreignField:'_id',
                            as:'product'
                        }
                    },
                    {
                        $project:{
                            Item:1,quantity:1,product:{$arrayElemAt:['$product',0]}
                        }
                    },
                    {
                        $group:{
                            _id:null,
                            total:{
                            $sum:
                                {
                                    $multiply:[

                                    {
                                        $toInt:'$quantity'
                                    },

                                    {
                                        $toInt:'$product.price'
                                    }]
                                
                                }
                            }
                        }
                    }
                    
                ]).toArray()
                console.log('jbsvjhjhs');
                console.log(total[0].total)
                resolve(total[0].total)
                console.log("vhgcywef");
            }) 
        },
        placeOrder:(order,products,total)=>{
          return new Promise((resolve,reject)=>{
          console.log(order,products,total); 
          let status=order['payment-method']==='COD'?'placed':'pending'
          let orderObj={
            deliveryDetails:
               ObjectId(order['payment-address'])
            ,
            userId:ObjectId(order.userId),
            paymentMethod:order['payment-method'],
            products:products,
            totalAmount:total,
            status:status,
            date:new Date()
          } 
          db.get().collection(collection.ORDER_COLLECTION).insertOne(orderObj).then((response)=>{
            console.log(response.insertedId);
            // db.get().collection(collection.CART_COLLECTION).deleteOne({user:ObjectId(order.userId)})
            resolve(response.insertedId)
          })
          })
        },
        getCartProductList:(userId)=>{
            return new Promise(async(resolve,reject)=>{
                console.log(userId)
                console.log("malmklagvmlfkvmlk");
                let cart=await db.get().collection(collection.CART_COLLECTION).findOne({user:ObjectId(userId)})
                console.log(cart);
                resolve(cart.products)
            })
            
        },
        getUserOrders:(userId)=>{
            return new Promise(async(resolve,reject)=>{
                console.log(userId)
                let orders=await db.get().collection(collection.ORDER_COLLECTION)
                .find({userId:ObjectId(userId)}).sort({date:-1}).toArray()
                console.log(orders)
                resolve(orders)
            })
        },
        getOrderProducts:(orderId)=>{
            console.log("ordersss");
            return new Promise(async(resolve,reject)=>{
                let orderItems=await db.get().collection(collection.ORDER_COLLECTION).aggregate([
                    {
                        $match:{_id:ObjectId(orderId)}
                    },
                    {
                        $unwind:'$products'
                    },
                    {
                        $project:{
                            Item:"$products.Item",
                            quantity:'$products.quantity'
                        }
                    },
                    {
                        $lookup:{
                            from:collection.PRODUCT,
                            localField:'Item',
                            foreignField:'_id',
                            as:'product'
                        }
                    },
                    {
                        $project:{
                            Item:1,quantity:1,product:{$arrayElemAt:['$product',0]}
                        }
                    }
                ]).toArray()
                console.log('order items');
                console.log(orderItems);
                resolve(orderItems)
            })
        },
        generateRazorPay:(orderId,total)=>{
            return new Promise((resolve,reject)=>{
                console.log(orderId);
                const options={
                    amount: total,
                    currency: "INR",
                    receipt: ""+orderId
                }
                instance.orders.create(options,function(err,order){
                    if(err){
                        console.log("errorrr");
                        console.log(err);
                    }else{
                   console.log("New order: ",order);
                   console.log("vghfhgjgds");
                   console.log(order);
                   resolve(order)
                  }
                }) 
            })
        },
        generatePayPal: (orderId, totalPrice) => {
            console.log('paypal working');
            return new Promise((resolve, reject) => {
                const create_payment_json = {
                    "intent": "sale",
                    "payer": {
                        "payment_method": "paypal"
                    },
                    "redirect_urls": {
                        return_url: "http://localhost:3000/order-success",
                        cancel_url: "http://localhost:3000/cancel"
                    },
                    "transactions": [
                        {
                            "item_list": {
                                "items": [
                                    {
                                        "name": "Red Sox Hat",
                                        "sku": "001",
                                        "price": totalPrice,
                                        "currency": "USD",
                                        "quantity": 1
                                    }
                                ]
                            },
                            "amount": {
                                "currency": "USD",
                                "total": totalPrice
                            },
                            "description": "Hat for the best team ever"
                        }
                    ]
                };
    
                paypal.payment.create(create_payment_json, function (error, payment) {
                    if (error) {
                        console.log("paypal int. err stp ...4", error);
                        throw error;
    
                    } else {
                        console.log(payment, "****a");
                        resolve(payment);
                    }
                });
            });
        },

        addAddress: (userId,details) => {
            console.log(userId);
            console.log(details);
            console.log('userygyg');
            return new Promise(async (resolve, reject) => {
                let tempId= moment().format().toString()

                tempId.replace(/\s+/g, ' ').trim()
    
                let date = new Date()

           

              let address = await db
                .get()
                .collection(collection.ADDRESS_COLLECTION)
                .insertOne({user:ObjectId(userId),
                    
                 name:details.name,
                address:details.address,
                pincode:details.pincode,
                city:details.city,
                id:tempId
                })
                console.log("reached here");
              console.log(address);
              resolve(address);
            });
          },
          getAddress:(userId)=>{
            return new Promise(async (resolve, reject) => {
                let address = await db
                  .get()
                  .collection(collection.ADDRESS_COLLECTION)
                  .find({user:ObjectId(userId)}).toArray()
                console.log(address);
                resolve(address);
              });
          },

/* -------------------------------------------------------------------------- */
/*                              get edit address                              */
/* -------------------------------------------------------------------------- */
          getEditAddress:(Id,userId)=>{
            console.log('get edit address');
            console.log(Id);
            return new Promise(async (resolve, reject) => {
                let address = await db
                  .get()
                  .collection(collection.ADDRESS_COLLECTION)
                  .findOne({$and:[{user:ObjectId(userId)},{id:Id}]
                    })
                console.log(address);
                resolve(address);
              });
          },


          /* -------------------------------------------------------------------------- */
          /*                              post edit address                             */
          /* -------------------------------------------------------------------------- */

          editAddress:(address,userId,id)=>{
            return new Promise(async(resolve,reject)=>{
                console.log('edit address jndkj');
                console.log(id);
             try{
             let data = await db.get().collection(collection.ADDRESS_COLLECTION).updateOne({user:ObjectId(userId),id:id},
                {
                    $set: 
                    {
                        name: address.name,
                        address:address.address,
                        pincode:address.pincode,
                        city:address.city,
                    }
                 })
                
        
                resolve(data)
        
             } catch(error){
                    console.log(error);
                }
            })
        },


        /* -------------------------------------------------------------------------- */
        /*                               delete Address                               */
        /* -------------------------------------------------------------------------- */

        deleteAddress:(userId,id)=>{
            console.log("userId"+userId);
            console.log('id',id);
            return new Promise(async(resolve,reject)=>{
        
                await db.get().collection(collection.ADDRESS_COLLECTION).deleteOne({user:ObjectId(userId),id:id})
        
                .then((response)=>{
        
                    resolve(response)
                })
            })
        },
        addWishlist:(userId,proId)=>{
            let proObj={
                Item:ObjectId(proId),
                quantity:1
            }
            return new Promise(async(resolve,reject)=>{
            let wishlist=await db.get().collection(collection.WISHLIST_COLLECTION).findOne({user:ObjectId(userId)})
            if(wishlist){
                let wishExist=wishlist.products.findIndex(products=> products.Item==proId)
                console.log(wishExist);
                
                if(wishExist!=-1){
                    console.log('product already in wishlist');
                   resolve({status:false})
                }else{ 
                    console.log('product added to wishlist');
                db.get().collection(collection.WISHLIST_COLLECTION)
                .updateOne({user:ObjectId(userId)},
                {
                   
                        $push:{products:proObj}
                    
                }).then((response)=>{
                    console.log('responseo'+response);
                    resolve({status:true})
                })
            }
    
            }else{
                    console.log('product added to wishlist');
                    console.log('product added');
                let wishObj={
                    user:ObjectId(userId),
                    products:[proObj]
                }
                db.get().collection(collection.WISHLIST_COLLECTION).insertOne(wishObj).then((response)=>{
                    resolve({status:true})
                })
            }
           
            })
            },
           getWishProduct:(userId)=>{
            console.log(userId);
                return new Promise(async(resolve,reject)=>{
                    let wishItems=await db.get().collection(collection.WISHLIST_COLLECTION).aggregate([
                        {
                            $match:{user:ObjectId(userId)}
                        },
                        {
                            $unwind:"$products"
                        },
                        {
                          $project:{
                            Item:'$products.Item'
                          }
                        },
                        {
                            $lookup:{
                                from:collection.PRODUCT,
                                localField:'Item',
                                foreignField:'_id',
                                as:'product'
                            }
                        },{
                            $project:{
                                Item:1,product:{$arrayElemAt:['$product',0]}
                            }
                        }
                        
                    ]).toArray()
                    console.log(wishItems)
                    resolve(wishItems)
                })
            },getwishlist:()=>{
                return new Promise(async(resolve,reject)=>{
                  let wish=await db.get().collection(collection.WISHLIST_COLLECTION).find().toArray()
                  resolve(wish)
                })
              },
           changePaymentStatus:(orderId)=>{
            return new Promise((resolve,reject)=>{
                db.get().collection(collection.ORDER_COLLECTION)
                .updateOne({_id:ObjectId(orderId)},
                {
                    $set:{
                    status:'placed'
                    }
                }
                ).then(()=>{
                    resolve()
                })

            })
           },
           verifyPayment: (details) => {
            return new Promise((resolve, reject) => {
                const crypto = require('crypto')
                let hmac = crypto.createHmac('sha256',process.env.KEY_SECRET)
    
                hmac.update(details['payment[razorpay_order_id]'] + '|' + details['payment[razorpay_payment_id]'])
                hmac = hmac.digest('hex')
                if (hmac == details['payment[razorpay_signature]']) {
                    resolve()
                }
                else {
                    reject()
                }
    
            })
    
        },
        cancelOrder: (Id) => {
            console.log('order cancelled!!!!!!!!!!!!!!!!!!!');
            return new Promise((resolve, reject) => {
              console.log(Id);
              db.get()
                .collection(collection.ORDER_COLLECTION)
                .updateOne(
                  { _id:ObjectId(Id) },
                  {$set:{status:'cancelled'}})
                .then((response) => {
                  resolve();
                  console.log(response);

                });
            });
          },
          shipOrder: (Id) => {
            return new Promise((resolve, reject) => {
              console.log(Id);
              db.get()
                .collection(collection.ORDER_COLLECTION)
                .updateOne(
                  { _id:ObjectId(Id) },
                  {$set:{status:'shipped'}})
                .then((response) => {
                   resolve();
                });
            });
          },
          deleteCart:(Id,userId)=>{
            console.log(Id);
            console.log('jjjcjjnccnmcbmnBm');
            return new Promise ((resolve,reject)=>{
               db.get().collection(collection.CART_COLLECTION).deleteOne({user:ObjectId(userId)}).then((response)=>{
                resolve()
               })
                // console.log(response);
            })
            
          }


        
        
        
        


    }
    
