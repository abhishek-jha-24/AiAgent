const Joi = require("joi");

const baseAsset = Joi.object({
	assetUrl: Joi.string().uri().required(),
	_Category_of_Asset: Joi.number().required(),
	_AssetName: Joi.string().required(),
	_Description_of_the_asset: Joi.string(),
	private: Joi.boolean(),
	properties: Joi.array().items(
		Joi.object({
			name: Joi.string().required(),
			value: Joi.string().required(),
		})
	),
	stats: Joi.array().items(
		Joi.object({
			name: Joi.string().required(),
			value: Joi.number().required(),
			max: Joi.number().required(),
		})
	),
	levels: Joi.array().items(
		Joi.object({
			name: Joi.string().required(),
			value: Joi.number().required(),
			max: Joi.number().required(),
		})
	),
});

const assetValidator = Joi.object({
	ownerId: Joi.string().required(),
	asset:baseAsset
});

const updateAssetValidator = Joi.object({
	ownerId : Joi.string().required(),
	_id:Joi.string().required(),
	asset:baseAsset
});

const deleteAssetValidator = Joi.object({
		ownerId:Joi.string().required(),
		_id:Joi.string().required()
});

const getUsersAssetsValidator = Joi.object({
	ownerId:Joi.string().required(),
});

const getAssetByIdValidator = Joi.object({
	_id:Joi.string().required(),
});
// getUsersAssetsValidator
module.exports = { assetValidator , getUsersAssetsValidator,updateAssetValidator,deleteAssetValidator , getAssetByIdValidator} ;
