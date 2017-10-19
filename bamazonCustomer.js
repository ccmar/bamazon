var mysql = require('mysql');
var inquirer = require('inquirer');
var productArray;
var connection = mysql.createConnection({
  host     : 'localhost',
  port: 3306,
  user     : 'root',
  password : 'root',
  database : 'bamazon'
});
 
connection.connect();
 function loadProducts(){
	connection.query('SELECT * FROM Products', function (error, results, fields) {
	  if (error) throw error;
	  productArray = results;
	  for( var i = 0; i < results.length; i++){
	  	console.log(`
	  	Item#: ${results[i].item_id}
		Product Name: ${results[i].product_name}
		Department Name: ${results[i].department_name}
		Price: $${results[i].price} 
		Stock Quantity: ${results[i].stock_quantity}`)
	  }	
	  inquirer.prompt([
	  	{
	  		type: "input",
	  		name: "selectedID",
	  		message: "Please enter the item_id you would like to purchase"
	  	}]).then(function (answers) {
	  		var itemNum = answers.selectedID;
	    	inquirer.prompt([
		  	{
		  		type: "input",
		  		name: "selectedUnits",
		  		message: "Please enter the number of units you would like to purchase"
		  	}]).then(function (answers) {
		  		var itemObject = findMatch(itemNum);
		  		if(itemObject){
			  		if(answers.selectedUnits > itemObject.stock_quantity){
			  			console.log("Insufficient inventory");
			  		}else {
			  			//at this point the item exists, AND there is enough quantity
			  			console.log("We have that in stock!");
			  			console.log(itemObject.stock_quantity);
			  			console.log(answers.selectedUnits);
			  			//updateQuantity(itemNum, answers.selectedUnits);
			  			//(not needed) console.log("You chose to purchase " + answers.selectedUnits + " of item " + itemNum)
			  			makePurchase(itemObject, parseInt(itemObject.stock_quantity) - parseInt(answers.selectedUnits))
			  		}
		  		}else {
		  			console.log("Sorry I was unable to find your product");
		  		}
		  	});

	});

});}

loadProducts();

function findMatch(itemNum){
	for(var i = 0; i < productArray.length; i++){
		if(productArray[i].item_id == itemNum){
			return productArray[i]
		}
	}
}

function makePurchase(product, quantity) {
  connection.query(
    "UPDATE products SET stock_quantity = ? WHERE item_id = ?",
    [quantity, product.item_id],
    function(err, res) {
      // Let the user know the purchase was successful, re-run loadProducts
      console.log("\nSuccessfully purchased " + quantity + " " + product.product_name + "'s!");
      loadProducts();
    }
  );
}
