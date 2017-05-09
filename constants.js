const messages = {
	"errorRetreivingData": "Error occured while retreiving the data from collection.",
	"successRetreivingData" : "Data retreived successfully from the collection.",

	//forgot password
	"successSendingForgotPasswordEmail": "Password sent successfully",
	"successSendingForgotPasswordLink": "Please check your mail to reset password.",
	//change password
	"errorSendingForgotPasswordEmail": "Username doesn't  exist in database",

	//user message
	"userSuccess": "User saved successfully",
	"userStatusUpdateFailure" : "Error occured while updating Status",
	"userStatusUpdateSuccess" : "User update successfully",
	"userDeleteFailure": "Error occured while deleting the user",
	"userDeleteSuccess": "User(s) deleted successfully",
	"userUpdateSuccess": "User updated successfully",

	// Error Messages for shop
	"errorInSave":"Error occured while saving.",
	"saveSuccessfully":"Successfully saved.",

	// for the required fields
	"requiredFields":"Please pass the required fields."
}

const distance = {
	"shopDistance" : 500000 // in miles in km 0.001 
}

var obj = {messages:messages,distance:distance};
module.exports = obj; 