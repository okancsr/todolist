//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

mongoose.connect("mongodb://localhost:27017/todolistDB")

const itemsSchema = ({ 
  name: String
});

const Item = mongoose.model('Item', itemsSchema);

const listSchema = ({ 
  name: String,
  items: [itemsSchema]
});

const List = mongoose.model('List', listSchema);

const defaultItems = [
  new Item({ name: 'Welcome to toDOList' }),
  new Item({ name: 'Hit the + button to add a new item' }),
  new Item({ name: '<-- Hit this to delete an item' })
];

async function getFoundItems() {
  const foundItems = await Item.find({});
  return foundItems;
}

app.get("/", async function(req, res) {
  const foundItems = await getFoundItems();
// Check if the database is empty
  if (foundItems.length === 0) {
    // Insert the default items
    await Item.insertMany(defaultItems);
  }
res.render("list.ejs", {listTitle: "Tommarrow", newListItems: foundItems});
});

app.get("/:customListName", async function (req, res) {
  const customListName = req.params.customListName;
try{
  const foundList = await List.findOne({name: customListName});
  if (!foundList){
   // Creat a new List
   const list = new List({
    name: customListName,
    items: defaultItems
  });
  
  list.save();
  res.redirect("/" + customListName);

  } else {
  //Show existing list
  res.render("list.ejs", {listTitle: foundList.name, newListItems: foundList.items});
  }
  } catch (err){
    console.log(err);
  }

});

app.post("/", function(req, res){
const itemName = req.body.newItem;
  const item = new Item ({
    name: itemName
  })

  item.save()
  res.redirect("/");
});

app.post("/delete", function(req, res) {
  const checkedItemId = req.body.checkbox;

  Item.findByIdAndRemove(checkedItemId)
    .then(() => {
      console.log("Delete Success.");
      // The item was successfully deleted
      res.redirect("/");
    })
    .catch(err => {
      // There was an error deleting the item
      console.log(err);
    });
});

 app.get("/work", function(req,res){
  res.render("list", {listTitle: "Work List", newListItems: workItems});
});

app.get("/about", function(req, res){
  res.render("about");
});

app.listen(3000, function() {
  console.log("Server started on port 3000");
});
