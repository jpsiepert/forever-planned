var app = angular.module('wedding');

app.controller('ideaBoardCtrl', function($scope, ideaBoardService, authService, $state){
	
	$scope.addItemButton = false;
	$scope.addItemInput = false;
	$scope.newBoardTitle = false;
	$scope.itemQty = false;
	$scope.itemPrice = false;
	$scope.editRow = false;
	$scope.activeItem;
	$scope.activeSave;	
	$scope.activeSaveButton;
	$scope.activeQty;
	$scope.activePrice;


	$scope.newBoard = {};



	var getUser = function(){
		if($scope.currentUser){
			ideaBoardService.getUser($scope.currentUser)
		.then(function(results){
			
			$scope.boards = results.ideas.reverse();
			
			$scope.items = results.ideas
			$scope.currentUser = results
			
		})
		}
		
	};
	getUser();
	
	$scope.addBoard = function(){
		
		$scope.newBoard.title = $scope.hello.toUpperCase();
		
		ideaBoardService.addBoard($scope.newBoard, $scope.currentUser)
		.then(function(results){
			console.log("the Results ", results)
			$scope.boards = results.ideas.reverse();
			var arr = $scope.boards.ideas
			console.log(arr)
			$scope.newBoard.title = '';
			$scope.newBoardTitle = false;
		})
	}
	$scope.addToList = function(i, board, n, p, q){
		var newItem = {
			name: n[i],
			price: p[i],
			quantity: q[i],
		}

		if(!p || !q){
			newItem.total = 0;
		} else {
			newItem.total = q * p;
		}
		//when the newidea get's pushed I think it somehow gets confused and adds a title . . 
		board.boardItems.push(newItem);
		
		$scope.saveBoard(board, i);
		n[i] = '';
		p[i] = '';
		q[i] = '';

		
	}
	//TODO: not passing i . . . to change active save. Right now, it's reloading
	$scope.saveBoard = function(board, i){

		$scope.currentUser.ideas.push(board.boardItems);
		authService.updateUser($scope.currentUser).
		then(function(res){
			ideaBoardService.saveBoard(board, $scope.currentUser)
			.then(function(user){
				$scope.currentUser = user;
				$scope.boards = user.ideas.reverse();
				//$scope.activeSave = i;
				//$scope.activeSaveButton = false;
				$scope.editRow = false;
				$scope.activeQty = false;
				$scope.activePrice = false;
				$scope.activeItem = false;
			
			})
		});
	};



  
	$scope.saveBoardBudget = function(board, item){
		//console.log("board", board, "item", item)


		if(item.includeBudget === true){
			$scope.currentUser.estimatedBudget += item.total
			$scope.saveBoard(board)
		} else if (item.includeBudget === false){
			if(!item.purchased){
				$scope.currentUser.estimatedBudget -= item.total
				$scope.saveBoard(board)
			} else if(item.purchased === true){
				item.purchased = false;
				$scope.currentUser.purchasedBudget += item.total
				$scope.saveBoard(board)
			}


		}
		
	}

	$scope.saveEditedItem = function(board, item, editName, editQuantity, editPrice){

		var newTotal = 0;
		
		if(editName || editQuantity || editPrice){
			if(editQuantity && editPrice){
				newTotal = editQuantity * editPrice
			}
			console.log('new total ', newTotal)

			console.log('came to edit');
			item.name = editName
			item.price = editPrice
			item.quantity = editQuantity
			editName = '';
			editPrice = '';
			editQuantity = '';
			if(item.purchased === true){
				$scope.currentUser.purchasedBudget += item.total;
				item.total = newTotal
				$scope.currentUser.purchasedBudget -= newTotal;
				$scope.saveBoard(board);
			} else if(item.includeBudget === true){
				$scope.currentUser.estimatedBudget -= item.total;
				item.total = newTotal
				$scope.currentUser.estimatedBudget += newTotal;
				$scope.saveBoard(board)
			} else {
				$scope.saveBoard(board)
			}


		}
	}

	$scope.purchased = function(item, bIndex, iIndex, board){
		//console.log(item, bIndex, iIndex, board);
		item.purchased = true;
		$scope.currentUser.purchasedBudget -= item.total;
		$scope.currentUser.estimatedBudget -= item.total;
		//console.log('updated', board)
		$scope.saveBoard(board);
		//ideaBoardService.updateBudget($scope.currentUser);
	}

	$scope.unPurchase = function(item, board){
		item.purchased = false;
		item.includeBudget = false;
		$scope.currentUser.purchasedBudget += item.total;
		$scope.saveBoard(board)
	}

	$scope.showNewBoard = function(){
		$scope.newBoardTitle = true;

	}

	$scope.showItemInput = function(i){//ng-click calls this function
		$scope.activeItem = i;
		//$scope.activeSaveButton = i;

	}

	$scope.addItemInput = function(i){//ng-show calls this function
		return $scope.activeItem === i;
	}

	$scope.saved = function(i){//ng-show calls this function
		return $scope.activeSave === i;
	}

	$scope.saveButton = function(i){//ng-show calls this function
		return $scope.activeSaveButton === i;
	}


	$scope.showQty = function(i){
		$scope.activeQty = i;
	}
	$scope.itemQty = function(i){
		return $scope.activeQty === i;
	}

	$scope.showPrice = function(i){
		$scope.activePrice = i;
	}

	$scope.itemPrice = function(i){
		return $scope.activePrice === i;
	}

	
	$scope.deleteBoard = function(board){
		console.log(board)
		ideaBoardService.deleteBoard(board, $scope.currentUser).then(function(){
			getUser();
		})
	}

	$scope.deleteRow = function(i, item, board){
		//console.log(i, item, board)

		if(item.includeBudget === true && item.purchased === false){
			$scope.currentUser.estimatedBudget -= item.total
			board.boardItems.splice(i, 1);
			console.log('deleted? ', board)
			$scope.saveBoard(board);
		}
		else if(item.purchased === true){
			$scope.currentUser.purchasedBudget += item.total;
			board.boardItems.splice(i, 1);
			console.log('deleted? ', board)

			$scope.saveBoard(board);
		} else {
			board.boardItems.splice(i, 1);
			//console.log('deleted? ', board)

			$scope.saveBoard(board);
		}

	}

	$scope.addToEstBudget = function(total){
		$scope.estimatedBudget = $scope.budget -= total;
	}

})