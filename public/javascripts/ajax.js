
function changeQuantity(cartId, proId, userId, count) {
  // alert('hi guys')
  console.log(userId)
  console.log("dkmclmdklcmlkmclkmscmlsk")
  event.preventDefault()
  let quantity = parseInt(document.getElementById(proId).innerHTML)
  count = parseInt(count)

  $.ajax({
    url: '/change-product-quantity',
    data: {
      cart: cartId,
      product: proId,
      count: count,
      quantity: quantity,
      user: userId
    },
    method: 'post',
    success: (response) => {
      if (response.removeProduct) {
        swal({
          title: "Are you sure?",
          text: "Once deleted, you will not be able to recover this imaginary file!",
          icon: "warning",
          buttons: true,
          dangerMode: true,
        })
        location.reload()
      } else {
        document.getElementById(proId).innerHTML = quantity + count
        document.getElementById('total').innerHTML = response.total
      }
    }


  })
}


$("#checkout-form").submit((e) => {
  e.preventDefault()
  $.ajax({
    url: '/place-order',
    method: 'post',
    data: $('#checkout-form').serialize(),
    success: (response) => {
      alert(response)
      
      if (response.codSuccess) {
        location.href = '/order-success'
      } else if (response.razorPay) {
        alert('razorpay')
        razorpayPayment(response)
        console.log(response);
      }
      else if (response.payPal) {

        alert('paypal')


        for (let i = 0; i < response.links.length; i++) {

          if (response.links[i].rel === "approval_url") {

            location.href = response.links[i].href;

          }


        }

      }
    }

  })
})


function razorpayPayment(order) {
  var options = {
    "key": "rzp_test_wRx7xse3g4i61M", // Enter the Key ID generated from the Dashboard
    "amount": order.amount, // Amount is in currency subunits. Default currency is INR. Hence, 50000 refers to 50000 paise
    "currency": "INR",
    "name": "Wardrobe",
    "description": "Test Transaction",
    "image": "https://example.com/your_logo",
    "order_id": order.id, //This is a sample Order ID. Pass the `id` obtained in the response of Step 1
    "handler": function (response) {

      verifyPayment(response, order)
    },
    "prefill": {
      "name": "Gaurav Kumar",
      "email": "gaurav.kumar@example.com",
      "contact": "9999999999"
    },
    "notes": {
      "address": "Razorpay Corporate Office"
    },
    "theme": {
      "color": "#3399cc"
    }
  };
  var rzp1 = new Razorpay(options);
  rzp1.open();

}
function verifyPayment(payment, order) {
  $.ajax({
    url: '/verify-payment',
    data: {
      payment,
      order
    },
    method: 'post',
    success:(response)=>{
      if(response.status){
        location.href='/order-success'
      }else{
        swal('Payment failed!!!!!!!!!!!!!!!')
      }
     
    }
  })
}

function deleteAddress(id){
      swal({
        title: "Are you sure?",
        text: "Once deleted, you will not be able to recover this imaginary file!",
        icon: "warning",
        buttons: true,
        dangerMode: true,
      })
      .then((willDelete) => {
         if (willDelete) {

          $.ajax({
            url:'/delete_address'+id,
            method:'get',
            success: (response) => {

              if(response){
             swal("Poof! Your imaginary file has been deleted!")
          
             location.reload()
        }
      } 
      })
     } else {
          swal("Your imaginary file is safe!");
        }
      });
    }


    function cancelOrder(orderId, proId,response) {
      swal({
          title: "Are you sure?",
          text: "you are going to cancel your order!",
          icon: "warning",
          buttons: true,
          dangerMode: true,
      })
          .then((willDelete) => {
              if (willDelete) {
                  $.ajax({
                      url: '/cancel_order',
                      data: {
                          order: orderId,
                          product: proId
                      },
  
                      method: 'post',
                      success: (response) => {
                          swal("Poof! Your order has been cancelled!", {
                              icon: "success",
                          });
  
                          location.reload()
                      }
                  })
  
  
              } else {
                  swal("Your product is safe!");
              }
          });
  
  }
  // function removeProductFromCart(id){
  //    alert('deletejhkajkdck')
  //   $.ajax({
  //     url:'/delete_cart'+id,
  //     method:'get',
  //     success: (response) => {

  //       if(response){
  //      swal("Poof! Your imaginary file has been deleted!")
    
  //      location.reload()
  //       }
  //     }
  //   })
  // }

  
  function removeProductFromCart(id) {
    swal({
        title: "Are you sure?",
        text: "Once deleted, you will not be able to recover this product !",
        icon: "warning",
        buttons: true,
        dangerMode: true,
    })
        .then((willDelete) => {
            if (willDelete) {
                $.ajax({
                    url: '/delete_cart'+id,

                    method: 'get',
                    success: (response) => {
                        swal("Poof! Your product has been deleted!", {
                            icon: "success",
                        });

                        location.reload()
                    }
                })


            } else {
                swal("Your product is safe!");
            }
        });

}








