//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const date = require(__dirname + "/date.js");
const _ = require("lodash");

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

mongoose.connect("mongodb+srv://angla1234567:angla1234567@cluster0.wsngt.mongodb.net/?retryWrites=true&w=majority", {useNewUrlParser: true});

const itemsSchema = { name: String };

const Item = mongoose.model("item", itemsSchema);

const item1 = new Item({ name: "Welcome to ToDo List"});

const item2 = new Item({ name: "Add new Item"});

const item3 = new Item({ name: "<-- Delete Item"});

const defaultItems = [item1, item2, item3];

const listSchema = {
  name: String,
  items: [itemsSchema]
};

const List = mongoose.model("List", listSchema);

app.get("/", function(req, res) {

  Item.find({}, (err, foundItems) => { 
    if(foundItems.length === 0) {
      Item.insertMany(defaultItems, function(err){
  if(err) {
    console.log(err);
  } else {
    console.log('Succesess item saved to db');
  }
});
    } else {res.render("list", {listTitle: day, newListItems: foundItems})}
     });
 const day = date.getDate();
});

app.post("/", function(req, res){

  const itemName = req.body.newItem;
  const listName = req.body.list;

  const item = new Item({
    name: itemName
  });

  if (listName === "Today") {
    item.save();
    res.redirect("/")
  } else {
    List.findOne({name: listName}, (err, foundList) => {
      foundList.items.push(item);
      foundList.save();
      res.redirect("/" + listName);
    });
  }
});

app.get("/:customListName", (req, res) => { 
  const customListName = _.capitalize(req.params.customListName);

  List.findOne({ name: customListName}, (err, foundList) => {
    if(!err){
      if(!foundList) {  
        const list = new List({ 
          name: customListName,
          items: defaultItems });
          list.save();
          res.redirect("/" + customListName);
      } else {
        res.render("List", {listTitle: foundList.name, newListItems: foundList.items })
      }
    }
  });
 });

app.post("/delete", (req, res) => {
  const checkedItemId = req.body.checkbox;
  const listName = req.body.listName;

  if (listName === "Today"){
    Item.findByIdAndRemove(checkedItemId, (err) => { 
      if(!err){ console.log("success Deleting");
      res.redirect("/"); } });
  } else {
    List.findOneAndUpdate({name: listName}, { $pull: {items: {_id: checkedItemId}}}, (err, foundList) => {
      if(!err) {
        res.redirect("/" + listName);
      }
    });
  }
});

app.get("/about", function(req, res){ res.render("about"); });

app.listen(3000, function() { console.log("Server started on port 3000"); });
