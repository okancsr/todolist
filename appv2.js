//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash"); 

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true})); 
app.use(express.static("public"));

mongoose.connect("mongodb+srv://okances:GiE7pp402zfHWJsI@cluster0.hqh7ptd.mongodb.net/todolistDB")

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
  try {
    const foundItems = await getFoundItems();

    // Check if the database is empty
    if (foundItems.length === 0) {
      await Item.insertMany(defaultItems);
    }

    // Render the page after items are inserted or found
    res.render("list.ejs", { listTitle: "Tommarrow", newListItems: foundItems });
  } catch (err) {
    console.error(err);
  }
});


app.get("/:customListName", async function (req, res) {
  const customListName = _.capitalize(req.params.customListName);
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


app.post("/", async function(req, res) {
  const itemName = req.body.newItem;
  const listName = req.body.list;

  const item = new Item({
    name: itemName
  });

  if (listName === "Tommarrow") {
    item.save();
    res.redirect("/");
  } else {
    try {
      const foundList = await List.findOne({ name: listName });

      if (foundList) {
        foundList.items.push(item);
        await foundList.save();
        res.redirect("/" + listName);
      } else {
        // List not found, create a new one
        const newList = new List({
          name: listName,
          items: [item]
        });
        await newList.save();
        res.redirect("/" + listName);
      }
    } catch (err) {
      console.log(err);
    }
  }

});

app.post("/delete", async (req, res) => {
  const checkedItemId = req.body.checkbox;
  const listName = req.body.listName;
  // List name (e.g., "Tommarrow")
  console.log(listName);
  try {
    if (listName === "Tommarrow") {
      // If the item is in the default list
      await Item.findByIdAndRemove(checkedItemId);
      console.log("Item deleted successfully.");
      res.redirect("/");
    } else {
      // If the item is in a custom list
      const foundList = await List.findOne({ name: listName });
      if (foundList) {
        foundList.items.pull({ _id: checkedItemId });
        await foundList.save();
        console.log("Item deleted from custom list.");
        res.redirect("/" + listName);
      }
    }
  } catch (err) {
    console.error("Error deleting item: " + err);
  }
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
