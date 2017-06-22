const messages = {
	"errorRetreivingData": "Error occured while retreiving the data from collection.",
	"successRetreivingData": "Data retreived successfully from the collection.",

	//forgot password
	"successSendingForgotPasswordEmail": "Password sent successfully",
	"successSendingForgotPasswordLink": "Please check your mail to reset password.",
	//change password
	"errorSendingForgotPasswordEmail": "Username doesn't  exist in database",

	//user message
	"userSuccess": "User saved successfully",
	"userStatusUpdateFailure": "Error occured while updating record",
	"userStatusUpdateSuccess": "Updated successfully",
	"userDeleteFailure": "Error occured while deleting the user",
	"userDeleteSuccess": "Deleted successfully",
	"userUpdateSuccess": "User updated successfully",

	// Error Messages for shop
	"errorInSave": "Error occured while saving.",
	"saveSuccessfully": "Successfully saved.",

	// for the required fields
	"requiredFields": "Please pass the required fields.",
        
     //Others
    "chairPostedSuccess":"Chair posted successfully",
    "email":"ankushs.sdei@gmail.com"

}

const distance = {
	"shopDistance": 500000,
	"distanceMultiplierInMiles": 0.000621371,
	"distanceMultiplierInkm": 0.001
}
const admin = {
	"email":"ankushs.sdei@gmail.com"
}
const timeSlots = {
	"morning": [
		{"time":"9:00","isAvailable":true},
		{"time":"9:15","isAvailable":true},
		{"time":"9:30","isAvailable":true},
		{"time":"9:45","isAvailable":true},
		{"time":"10:00","isAvailable":true},
		{"time":"10:15","isAvailable":true},
		{"time":"10:30","isAvailable":true},
		{"time":"10:45","isAvailable":true},
		{"time":"11:00","isAvailable":true},
		{"time":"11:15","isAvailable":true},
		{"time":"11:30","isAvailable":true},
		{"time":"11:45","isAvailable":true}
	],
	"afternoon": [
		{"time":"12:00","isAvailable":true},
		{"time":"12:15","isAvailable":true},
		{"time":"12:30","isAvailable":true},
		{"time":"12:45","isAvailable":true},
		{"time":"1:00","isAvailable":true},
		{"time":"1:15","isAvailable":true},
		{"time":"1:30","isAvailable":true},
		{"time":"1:45","isAvailable":true},
		{"time":"2:00","isAvailable":true},
		{"time":"2:15","isAvailable":true},
		{"time":"2:30","isAvailable":true},
		{"time":"2:45","isAvailable":true},
		{"time":"3:00","isAvailable":true},
		{"time":"3:15","isAvailable":true},
		{"time":"3:30","isAvailable":true},
		{"time":"3:45","isAvailable":true},
		{"time":"4:00","isAvailable":true},
		{"time":"4:15","isAvailable":true},
		{"time":"4:30","isAvailable":true},
		{"time":"4:45","isAvailable":true}
	],
	"evening": [
		{"time":"5:00","isAvailable":true},
		{"time":"5:15","isAvailable":true},
		{"time":"5:30","isAvailable":true},
		{"time":"5:45","isAvailable":true},
		{"time":"6:00","isAvailable":true},
		{"time":"6:15","isAvailable":true},
		{"time":"6:30","isAvailable":true},
		{"time":"6:45","isAvailable":true},
		{"time":"7:00","isAvailable":true},
		{"time":"7:15","isAvailable":true},
		{"time":"7:30","isAvailable":true},
		{"time":"7:45","isAvailable":true},
		{"time":"8:00","isAvailable":true},
		{"time":"8:15","isAvailable":true},
		{"time":"8:30","isAvailable":true},
		{"time":"8:45","isAvailable":true}
	]
}

var obj = {
	messages: messages,
	distance: distance,
	timeSlots:timeSlots
};
module.exports = obj;