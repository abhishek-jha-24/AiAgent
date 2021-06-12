const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const assetSchema = new mongoose.Schema(
	{
		ownerId: { type: Schema.Types.ObjectId, ref: "User" },
		assetUrl: String,
		_Category_of_Asset: Number,
		_AssetName: String,
		_Description_of_the_asset: String,
		private: Boolean,
		chainInfo: {
			contract: String,
			token: String,
			chain: String,
		},
		meta: { type: Schema.Types.ObjectId, ref: "Assets_Properties" },
		likes: { type: Number, default: 0 },
		views: { type: Number, default: 0 },
		category: String,
	},
	{ timestamps: true }
);

module.exports = mongoose.model("Assets", assetSchema);
