//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const date = require(__dirname + "/date.js");
const mongoose = require('mongoose');
const app = express();
const _ = require("lodash");
app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));


mongoose.connect('mongodb+srv://admin-abid:Abidpass@cluster0.vlyam.mongodb.net/todolistDB', {useNewUrlParser: true, useUnifiedTopology: true});
const Item = mongoose.model("Item",{name:String});
const item1 = new Item({name:"Welcome to your todolist!"});
const item2 = new Item({name:"Hit the + button to add the new item."});
const item3 = new Item({name:"<-- Hit this to delete an item"});

const deafultItems = [item1,item2 ,item3];

const List = mongoose.model("List",{name:String,heading:String,items : [{name:String}]});


const workItems = [];

app.get("/", function(req, res) {



  Item.find(function(err,itemslist){

       if(itemslist.length===0){
         Item.insertMany(deafultItems,function(err){
           if(err){console.log("you got an error");}
           else{console.log("succesfully added");}
         })
         res.redirect("/");
       }

       else{res.render("list", {listTitle: "today",listHeading : "today", newListItems: itemslist});}
      })
    })





app.post("/", function(req, res){

  const newitem = req.body.newItem;
  const listName = req.body.list;

  if (listName=== "today") {

  const insertItem =new Item({name:newitem});
  insertItem.save();

    res.redirect("/");
  } else {
    List.find({name:listName},function(err,foundList){
      if(err){console.log("encounterd an error");}
      else{
        const insertItem =new Item({name:newitem});
        foundList[0].items.push(insertItem);
        foundList[0].save();

      res.redirect("/"+listName);
      }



});
}})


app.get("/:customListName/:customHeading",function(req,res){

  const customListName =   _.capitalize(req.params.customListName+"/"+req.params.customHeading);
  const customHeading =  _.capitalize(req.params.customHeading);
console.log(customListName);

 List.find({name:customListName},function(err,listArray){
  if(listArray.length===0){
    const list = new List({
    name : customListName,
    heading:customHeading,
   items : deafultItems
  })
    list.save();
res.redirect("/"+customListName);
  }
  else{
    const capturedList = listArray[0];
    res.render("list", {listTitle: capturedList.name,listHeading : capturedList.heading, newListItems: capturedList.items});

  }
 })


})

// app.get("/work", function(req,res){
//   res.render("list", {listTitle: "Work List", newListItems: workItems});
// });

app.get("/about", function(req, res){
  res.render("about");
});


app.post("/delete",function(req,res){
  const deleteValue = req.body.checkbox;
  const deleteInList = req.body.listName;

console.log(deleteValue);
  if(deleteInList==="today"){
    Item.deleteOne({_id : deleteValue},function(err){
      if(err){console.log("encounterd an error");}
      else{console.log("succesfully deleted")}
    });
    res.redirect("/");
  }
    else{
      // List.find({name:deleteInList},function(err,foundList){
      //   foundList[0].items
      //
      //    for(var i =0; i<foundList[0].items.length;i++){
      //      console.log("entered");
      //      console.log(foundList[0].items[i]._id);
      //
      //     if(foundList[0].items[i]._id==deleteValue){
      //       foundList[0].items.splice(i,1);
      //       console.log("value removed");
      //       break;
      //     }
      //    }
      // foundList[0].save();
      //   }); or

      List.findOneAndUpdate({name :deleteInList},{$pull : {items:{_id : deleteValue}}},function(err,foundList){
        if(err){console.log("encounterd an error");}
        else{console.log("succesfully updated");}
      })



      res.redirect("/"+deleteInList);
    }
  })

  app.get("/newList", function(req, res){
    res.render("signup");
  });

  app.post("/newUser", function(req,res){
    console.log(req.body);
    const customListName = req.body.firstName + req.body.lastName;
    const customHeading  = req.body.listName;

    res.redirect("/"+customListName+"/"+customHeading);
  })





  let port = process.env.PORT;
  if(port == null || port ==""){
    port=3000;
  }


  app.listen(port, function() {
    console.log("Server started succesfully");
  });
