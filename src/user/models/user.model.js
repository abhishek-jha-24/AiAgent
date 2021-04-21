var mongoose = require("mongoose");

var UserSchema = new mongoose.Schema(
    {
        username: 'string',
        account_address: 'Array',
        user_type: 'string',
        bio: 'string',
        email_address: 'string',
        bg_img_url: 'string',
        profile_pic_url: 'string',
        is_verified: 'bool',
        is_deleted: 'bool'
      },{timestamps : true}
);

// Virtual for user's full name
// UserSchema
// 	.virtual("fullName")
// 	.get(function () {
// 		return this.firstName + " " + this.lastName;
// 	});

module.exports = mongoose.model("User", UserSchema);