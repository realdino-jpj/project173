var uid = null

AFRAME.registerComponent("markerhandler", {
    init: async function () {
  
    // if user id is null then ask for an id
      if (uid === null) {
        this.askUserId();
      }

      
    //get the dishes collection from firestore database
    var toys = await this.getToys();

    // if marker if found then countinue 
      this.el.addEventListener("markerFound", () => {
        // if uid is not null then continue
        if (uid !== null) {
          var markerId = this.el.id;
          this.handleMarkerFound(toys, markerId);
        }
      });
  
      this.el.addEventListener("markerLost", () => {
        console.log("marker is lost")
        this.handleMarkerLost();
      });
    },

    // ask the user for an id and update the uid from null to the given id number
    askUserId: function() {
      var iconUrl =
        "https://raw.githubusercontent.com/whitehatjr/ar-toy-store-assets/master/toy-shop.png";
  
      swal({
        title: "Welcome to Toy Shop!!",
        icon: iconUrl,
        content: {
          element: "input",
          attributes: {
            placeholder: "Type your uid Ex:( U01 )"
          }
        }
      }).then(inputValue => {
        uid = inputValue;
      });
    },

    handleMarkerFound: function (toys,markerId) {

      var toy = toys.filter(toy => toy.id === markerId)[0];

      var x = Math.random(0,10)

      if(x>8){
        swal({
          icon: "warning",
          title: dish.dish_name.toUpperCase(),
          text: "This toy is not available now!!!",
          timer: 2500,
          buttons: false
        });
      }else{

      // Changing Model scale to initial scale
      var model = document.querySelector(`#model-${toy.id}`);
      model.setAttribute("position", toy.model_geometry.position);
      model.setAttribute("rotation", toy.model_geometry.rotation);
      model.setAttribute("scale", toy.model_geometry.scale);

      // make model visible
      var model = document.querySelector(`#model-${toy.id}`);
      model.setAttribute("visible", true);

      // make mian plane Container visible
      var mainPlane = document.querySelector(`#main-plane-${toy.id}`);
      mainPlane.setAttribute("visible", true);

      // selecting buttons
      var buttonDiv = document.getElementById("button-div");
      buttonDiv.style.display = "flex";
  
      var summaryButton = document.getElementById("order-summary-button");
      var orderButtton = document.getElementById("order-button");
      var payButton = document.getElementById("pay-button");
  
      // Handling Click Events
      summaryButton.addEventListener("click", function () {
        handleOrderSummary()
      });
  
      orderButtton.addEventListener("click", () => {

        uid = uid.toUpperCase();
        this.handleOrder(uid, toy);
        swal({
          icon: "https://i.imgur.com/4NZ6uLY.jpg",
          title: "Thanks For Order!",
          text: "Your order will be delievered at your selected address"
        });
      });

      summaryButton.addEventListener("click", function () {
        handlePayment()
      });
  
    }
    },
  
    handleMarkerLost: function () {
      // Changing button div visibility
      var buttonDiv = document.getElementById("button-div");
      buttonDiv.style.display = "none";
    },

    // gets the data from uid section of firebase
    getOrderSummary: async function(){
  
      return await firebase.firestore().collection("uid").doc(tNumber).get().then(doc => doc.data())
    },

    handleOrderSummary : async function(){

      // converting uid to uppercase letters
      uid = uid.toUpperCase();

      //get uid from database and giving its value to a variable
       var orderSummary = await this.getOrderSummary(uid)

       var modalDiv = document.getElementById("modal-div");
       modalDiv.style.display = "flex";

       modalDiv.style.display = "flex"
       var tableBodyTag = document.getElementById("bill-table-body")
       tableBodyTag.innerHTML = ""
       // 
       var currentOrders = Object.keys(orderSummary.current_orders)
       currentOrders.map(i =>{
         var tr =document.createElement("tr")
         var item =document.createElement("td")
         var price =document.createElement("td")
         var quantity =document.createElement("td")
         var subtotal =document.createElement("td")
         item.innerHTML = orderSummary.current_orders[i].item
         price.innerHTML = "$"+orderSummary.current_orders[i].price
         price.setAttribute("class","text-center")
         quantity.innerHTML = orderSummary.current_orders[i].quantity
         quantity.setAttribute("class","text-center")
         subtotal.innerHTML = "$"+orderSummary.current_orders[i].subtotal
         subtotal.setAttribute("class","text-center")
         tr.appendChild(item)
         tr.appendChild(price)
         tr.appendChild(quantity)
         tr.appendChild(subtotal)
         tableBodyTag.appendChild(tr)
       })
       //
       var Totaltr =document.createElement("tr")
       var td1 =document.createElement("td")
       td1.setAttribute("class","no-line")
       var td2 =document.createElement("td")
       td2.setAttribute("class","no-line")
       var td3 =document.createElement("td")
       td3.setAttribute("class","no-line")
       var strongTag =document.createElement("strong")
       strongTag.innerHTML = "total"
       td3.appendChild(strongTag)
       var td4 =document.createElement("td")
       td4.setAttribute("class","no-line text-right")
       td4.innerHTML = "$"+orderSummary.total_bill
     
       Totaltr.appendChild(td1)
       Totaltr.appendChild(td2)
       Totaltr.appendChild(td3)
       Totaltr.appendChild(td4)
     
       tableBodyTag.appendChild(Totaltr)
       },
     
       handlePayment: function(){
       document.getElementById("model-div").style.display = "none"
       var tNumber
       tableNumber<=9?(tNumber=`T0${tableNumber}`):`T${tableNumber}`
       firebase.firestore().collection("tables").doc(tNumber).update({
         current_orders: {},
         tltal_bill: 0
       })
       .then(()=>{
         swal({
           icon: "success",
           title: "thanks for paying",
           text: "we hope y0u enjoy our food",
           timer: 2500,
           buttons: false
         });
       })

    },
   
    handlePayment: function() {
      // Close Modal
      document.getElementById("modal-div").style.display = "none";
  
      // Getting UID
      uid = uid.toUpperCase();
  
      // Reseting current orders and total bill
      firebase
        .firestore()
        .collection("users")
        .doc(uid)
        .update({
          current_orders: {},
          total_bill: 0
        })
        .then(() => {
          swal({
            icon: "success",
            title: "Thanks For Paying !",
            text: "We Hope You Like Your Toy !!",
            timer: 2500,
            buttons: false
          });
        });
    },

    handleOrder: function(uid, toy) {
      // Reading current UID order details
      firebase
        .firestore()
        .collection("users")
        .doc(uid)
        .get()
        .then(doc => {
          var details = doc.data();
  
          if (details["current_orders"][toy.id]) {
            // Increasing Current Quantity
            details["current_orders"][toy.id]["quantity"] += 1;
  
            //Calculating Subtotal of item
            var currentQuantity = details["current_orders"][toy.id]["quantity"];
  
            details["current_orders"][toy.id]["subtotal"] =
              currentQuantity * toy.price;
          } else {
            details["current_orders"][toy.id] = {
              item: toy.toy_name,
              price: toy.price,
              quantity: 1,
              subtotal: toy.price * 1
            };
          }
  
          details.total_bill += toy.price;
  
          // Updating Db
          firebase
            .firestore()
            .collection("users")
            .doc(doc.id)
            .update(details);
        });
    },

    handleRatings: function(toy) {
      // Close Modal
      document.getElementById("rating-modal-div").style.display = "flex";
      document.getElementById("rating-input").value = "0";
  
      var saveRatingButton = document.getElementById("save-rating-button");
      saveRatingButton.addEventListener("click", () => {
        document.getElementById("rating-modal-div").style.display = "none";
        var rating = document.getElementById("rating-input").value;
  
        firebase
          .firestore()
          .collection("toys")
          .doc(toy.id)
          .update({
            rating: rating
          })
          .then(() => {
            swal({
              icon: "success",
              title: "Thanks For Rating!",
              text: "We Hope You Like Toy !!",
              timer: 2500,
              buttons: false
            });
          });
      });
    },

    getToys: async function () {
      return await firebase
        .firestore()
        .collection("toys")
        .get()
        .then(snap => {
          return snap.docs.map(doc => doc.data());
        });
    }
  });
  