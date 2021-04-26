var mongoose = require("mongoose");

var UserSchema = new mongoose.Schema(
    {
        username: {
            type: String,
            required: false
        },
        account_address: {
            type: Array,
            required: true
        },
        user_type: {
            type: String,
            required: false
        },
        bio: {
            type: String,
            required: false
        },
        email_address: {
            type: String,
            required: false
        },
        bg_img_url: {
            type: String,
            required: false
        },
        profile_pic_url: {
            type: String,
            required: false
        },
        is_verified: {
            type: String,
            required: false
        
        },
        is_deleted: {
            type: String,
            required: false
        
        },
        timestamps: {
            type: Date,
            default: Date.now
        
        }
});

// Virtual for user's full name
// UserSchema
// 	.virtual("fullName")
// 	.get(function () {
// 		return this.firstName + " " + this.lastName;
// 	});

module.exports = mongoose.model("User", UserSchema);