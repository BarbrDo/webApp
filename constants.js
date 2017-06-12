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
	"requiredFields": "Please pass the required fields."
}

const distance = {
	"shopDistance": 500000,
	"distanceMultiplierInMiles": 0.000621371,
	"distanceMultiplierInkm": 0.001
}
const timeSlots = {
	"morning": [
		"9:00",
		"9:15",
		"9:30",
		"9:45",
		"10:00",
		"10:15",
		"10:30",
		"10:45",
		"11:00",
		"11:15",
		"11:30",
		"11:45"
	],
	"afternoon": [
		"12:00",
		"12:15",
		"12:30",
		"12:45",
		"1:00",
		"1:15",
		"1:30",
		"1:45",
		"2:00",
		"2:15",
		"2:30",
		"2:45",
		"3:00",
		"3:15",
		"3:30",
		"3:45",
		"4:00",
		"4:15",
		"4:30",
		"4:45"
	],
	"evening": [
		"5:00",
		"5:15",
		"5:30",
		"5:45",
		"6:00",
		"6:15",
		"6:30",
		"6:45",
		"7:00",
		"7:15",
		"7:30",
		"7:45",
		"8:00",
		"8:15",
		"8:30",
		"8:45"
	]
}

var obj = {
	messages: messages,
	distance: distance,
	timeSlots:timeSlots
};
module.exports = obj;