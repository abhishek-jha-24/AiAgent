const Joi = require("joi");
 
const baseuser = Joi.object({
	username: Joi.string(),
	account_address: Joi.array().required(),
	user_type: Joi.string(),
	bio: Joi.string(),
	email_address:Joi.string(),
	bg_img_url:Joi.string(),
	profile_pic_url:Joi.string(),
	is_verified: Joi.boolean(),
	is_deleted: Joi.boolean()
	
// 	properties: Joi.array().items(
// 		Joi.object({
// 			name: Joi.string().required(),
// 			value: Joi.string().required(),
// 		})
// 	),
// 	stats: Joi.array().items(
// 		Joi.object({
// 			name: Joi.string().required(),
// 			value: Joi.number().required(),
// 			max: Joi.number().required(),
// 		})
// 	),
// 	levels: Joi.array().items(
// 		Joi.object({
// 			name: Joi.string().required(),
// 			value: Joi.number().required(),
// 			max: Joi.number().required(),
// 		})
// 	),
});


module.exports = {  baseuser} ;
