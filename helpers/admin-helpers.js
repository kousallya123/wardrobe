var db = require('../config/connection')
var collection = require('../config/collections')
var bcrypt = require('bcrypt')
const { USERSCOLLECTION } = require('../config/collections')
const { response } = require('express')
const collections = require('../config/collections')
const { ObjectID } = require('bson')
var objectId = require('mongodb').ObjectId

module.exports = {

  viewUsers: () => {
    return new Promise(async (resolve, reject) => {
      let data = await db.get().collection(collections.USERSCOLLECTION).find().toArray()
      resolve(data)

    })

  },
  blockUser: (userId) => {
    return new Promise(async (resolve, reject) => {
      await db.get().collection(collections.USERSCOLLECTION).updateOne({ _id: objectId(userId) }, { $set: { state: false } }).then((data) => {
        console.log(data)
        resolve(data)
      })
    })
  },

  unblockUser: (proId) => {
    return new Promise(async (resolve, reject) => {
      await db.get().collection(collections.USERSCOLLECTION).updateOne({ _id: objectId(proId) }, { $set: { state: true } }).then((data) => {
        console.log(data)
        resolve(data)
      })
    })
  },



  addProduct: (product, callback) => {

    console.log(product);
    db.get()
      .collection("product")
      .insertOne(product)
      .then((data) => {

        //console.log(data);
        callback(data.insertedId);
      });
  },


  getProductDetails: (prodId) => {
    console.log('hellooo');
    return new Promise((resolve, reject) => {
      db.get()
        .collection(collection.PRODUCT)
        .findOne({ _id: objectId(prodId) })
        .then((product) => {
          resolve(product);
        }).catch(() => {
          reject(err)
        })
    })
  },
  updateProduct: (prodId, proDetails) => {
    return new Promise((resolve, reject) => {
      db.get()
        .collection(collection.PRODUCT)
        .updateOne(
          { _id: objectId(prodId) },
          {
            $set: {
              name: proDetails.name,
              category: proDetails.category,
              price: proDetails.price,
            },

          },
          { upsert: true }
        )
        .then((response) => {
          resolve();
        });
    });
  },

  deleteProduct: (proID) => {
    return new Promise(async (resolve, reject) => {
      await db.get().collection(collections.PRODUCT).deleteOne({ _id: ObjectID(proID) }).then((data) => {
        resolve(data)
      })
    })
  },
  viewProducts: () => {
    return new Promise(async (resolve, reject) => {
      await db.get().collection(collections.PRODUCT).find().toArray().then((data) => {
        resolve(data)
      })
    })
  },
  


  addBanner: (banner, callback) => {

    console.log(banner);
    db.get()
      .collection("banner")
      .insertOne(banner)
      .then((data) => {

        //console.log(data);
        callback(data.insertedId);
      });
  },


  getBannerDetails: (bannerId) => {
    console.log('hellooo');
    return new Promise((resolve, reject) => {
      db.get()
        .collection(collection.BANNER)
        .findOne({ _id: objectId(bannerId) })
        .then((banner) => {
          resolve(banner);
        }).catch(() => {
          reject(err)
        })
    })
  },
  updateBanner: (bannerId, bannerDetails) => {
    return new Promise((resolve, reject) => {
      db.get()
        .collection(collection.BANNER)
        .updateOne(
          { _id: objectId(bannerId) },
          { upsert: true }
        )
        .then((response) => {
          resolve();
        });
    });
  },

  deleteBanner: (bannerID) => {
    return new Promise(async (resolve, reject) => {
      await db.get().collection(collections.BANNER).deleteOne({ _id: ObjectID(bannerID) }).then((data) => {
        resolve(data)
      })
    })
  },
  viewBanner: () => {
    return new Promise(async (resolve, reject) => {
      await db.get().collection(collections.BANNER).find().toArray().then((data) => {
        resolve(data)
      })
    })
  },

  getCategory: (prodId) => {
    console.log('hellooo');
    return new Promise((resolve, reject) => {
      db.get()
        .collection(collection.CATEGORY)
        .findOne({ _id: objectId(prodId) })
        .then((product) => {
          resolve(product);
        }).catch(() => {
          reject(err)
        })
    })
  },
  getAllCategory:()=>{
    return new Promise(async(resolve,reject)=>{
    let category=await db.get().collection(collection.CATEGORY).find().toArray()
    resolve(category)
    })
},
  // getAllCategory: (prodId) => {
  //   console.log('hellooo');
  //   return new Promise((resolve, reject) => {
  //     db.get()
  //       .collection(collection.CATEGORY)
  //       .find({ _id: objectId(prodId) })
  //       .then((Category) => {
  //         resolve(Category);
  //       }).catch(() => {
  //         reject(err)
  //       })
  //   })
  // },

  addCategory: (category,callback) => {
    console.log(category);
     db.get()
       .collection("category")
       .insertOne(category)
       .then((data) => {
        console.log(data);
         callback(data.insertedId);
       });
   },
   checkCategory: (catData) => {
    console.log('category checked');
    return new Promise(async (resolve,reject) => {
      let response = [];
      let cat = await db
        .get()
        .collection(collections.CATEGORY)
        .findOne({categoryname:catData.categoryname})
        
          console.log("cat"+cat);
          if (cat) {
            response.status = true;
            console.log("gggggggggggggggg")
            resolve(response);
          } else {
            response.status = false;
           console.log(response.status);
            resolve(response);
          }
        
    })

},
  viewCategory: () => {
    return new Promise(async (resolve, reject) => {
      let category = await db.get().collection(collections.CATEGORY).find().toArray();
      resolve(category)
    })
  },
  updateCategory: (prodId, proDetails) => {
    return new Promise((resolve, reject) => {
      db.get()
        .collection(collection.CATEGORY)
        .updateOne(
          { _id: objectId(prodId) },
          {
            $set: {
              categoryname: proDetails.categoryname
            },

          },
          { upsert: true }
        )
        .then((response) => {
          resolve();
        });
    });
  },

  deleteCategory: (proID) => {
    return new Promise(async (resolve, reject) => {
      await db.get().collection(collections.CATEGORY).deleteOne({ _id: ObjectID(proID) }).then((data) => {
        resolve(data)
      })
    })
  },
  getUserOrders:()=>{
    return new Promise(async(resolve,reject)=>{
     let order=await db.get().collection(collection.ORDER_COLLECTION).find().toArray()
     resolve(order)
     console.log(order);
    })
  },
  getDonutChart:()=>{
    return new Promise(async(resolve,rejecct)=>{
      let donut=await db.get().collection(collection.ORDER_COLLECTION).aggregate([
        { 
          $group:{
            _id:"$paymentMethod",
            count: {
              $sum: 1
          }
          }
        },
      ]).toArray()
      console.log(donut)
      resolve(donut)
    })
  },
  getLineChart:()=>{
    return new Promise(async(resolve,reject)=>{
      let year=await db.get().collection(collection.ORDER_COLLECTION).aggregate([
        {
          $project:{
           year:{
            $year:'$date'
           },
           totalAmount:1
            
          }
        },
        {
          $group:{
          _id:"$year",
          totalAmount:{
            $sum:"$totalAmount"
          }

          }
        }
        ,{
          $sort:{
            _id:1
          }
        },
        {
          $limit:10
        }
      ]).toArray()
      console.log(year);
      resolve(year)
    })
  },
  getBarChart:()=>{
    return new Promise(async(resolve,rejecct)=>{
      let stat=await db.get().collection(collection.ORDER_COLLECTION).aggregate([
        { 
          $group:{
            _id:"$status",
            count: {
              $sum: 1
          }
          }
        },
      ]).toArray()
      console.log(stat)
      resolve(stat)
    })
  }
  
}







