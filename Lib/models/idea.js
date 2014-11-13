var Mongoose = require('mongoose'),
	Schema = Mongoose.Schema,

var Idea = new Schema ({
	// image: {type: String},
	title: {type: String},
	listItem: [{type: String}],
	price: {type: Number},
	quantity: {type: Number},
	includeBudget: {type: Boolean},
	total: {type: Number}
})



module.exports = Mongoose.model('Idea', Idea)	