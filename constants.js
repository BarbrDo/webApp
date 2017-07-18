const messages = {
    "errorRetreivingData": "Error occured while retreiving the data from collection.",
    "successRetreivingData": "Data retreived successfully from the collection.",
    "successSendingForgotPasswordEmail": "Password sent successfully",
    "successSendingForgotPasswordLink": "Please check your mail to reset password.",
    "errorSendingForgotPasswordEmail": "Username doesn't  exist in database",
    "userSuccess": "User saved successfully",
    "userStatusUpdateFailure": "Error occured while updating record",
    "userStatusUpdateSuccess": "Updated successfully",
    "userDeleteFailure": "Error occured while deleting the user",
    "userDeleteSuccess": "Deleted successfully",
    "userUpdateSuccess": "User updated successfully",
    "errorInSave": "Error occured while saving.",
    "saveSuccessfully": "Successfully saved.",
    "requiredFields": "Please pass the required fields.",
    "chairPostedSuccess": "Chair posted successfully",
    "email": "ankushs.sdei@gmail.com",
    "emailsend" : "Thank you! Your feedback has been submitted"

}

const distance = {
    "shopDistance": 500000,
    "distanceMultiplierInMiles": 0.000621371,
    "distanceMultiplierInkm": 0.001
}

const offTimeSlots = {
    "morning": [
        {"time": "09:00", "isAvailable": false},
        {"time": "09:15", "isAvailable": false},
        {"time": "09:30", "isAvailable": false},
        {"time": "09:45", "isAvailable": false},
        {"time": "10:00", "isAvailable": false},
        {"time": "10:15", "isAvailable": false},
        {"time": "10:30", "isAvailable": false},
        {"time": "10:45", "isAvailable": false},
        {"time": "11:00", "isAvailable": false},
        {"time": "11:15", "isAvailable": false},
        {"time": "11:30", "isAvailable": false},
        {"time": "11:45", "isAvailable": false}
    ],
    "afternoon": [
        {"time": "12:00", "isAvailable": false},
        {"time": "12:15", "isAvailable": false},
        {"time": "12:30", "isAvailable": false},
        {"time": "12:45", "isAvailable": false},
        {"time": "1:00", "isAvailable": false},
        {"time": "1:15", "isAvailable": false},
        {"time": "1:30", "isAvailable": false},
        {"time": "1:45", "isAvailable": false},
        {"time": "2:00", "isAvailable": false},
        {"time": "2:15", "isAvailable": false},
        {"time": "2:30", "isAvailable": false},
        {"time": "2:45", "isAvailable": false},
        {"time": "3:00", "isAvailable": false},
        {"time": "3:15", "isAvailable": false},
        {"time": "3:30", "isAvailable": false},
        {"time": "3:45", "isAvailable": false},
        {"time": "4:00", "isAvailable": false},
        {"time": "4:15", "isAvailable": false},
        {"time": "4:30", "isAvailable": false},
        {"time": "4:45", "isAvailable": false}
    ],
    "evening": [
        {"time": "5:00", "isAvailable": false},
        {"time": "5:15", "isAvailable": false},
        {"time": "5:30", "isAvailable": false},
        {"time": "5:45", "isAvailable": false},
        {"time": "6:00", "isAvailable": false},
        {"time": "6:15", "isAvailable": false},
        {"time": "6:30", "isAvailable": false},
        {"time": "6:45", "isAvailable": false},
        {"time": "7:00", "isAvailable": false},
        {"time": "7:15", "isAvailable": false},
        {"time": "7:30", "isAvailable": false},
        {"time": "7:45", "isAvailable": false},
        {"time": "8:00", "isAvailable": false},
        {"time": "8:15", "isAvailable": false},
        {"time": "8:30", "isAvailable": false},
        {"time": "8:45", "isAvailable": false}
    ]
}

const timeSlots = {
    "morning": [
        {"time": "09:00", "isAvailable": true},
        {"time": "09:15", "isAvailable": true},
        {"time": "09:30", "isAvailable": true},
        {"time": "09:45", "isAvailable": true},
        {"time": "10:00", "isAvailable": true},
        {"time": "10:15", "isAvailable": true},
        {"time": "10:30", "isAvailable": true},
        {"time": "10:45", "isAvailable": true},
        {"time": "11:00", "isAvailable": true},
        {"time": "11:15", "isAvailable": true},
        {"time": "11:30", "isAvailable": true},
        {"time": "11:45", "isAvailable": true}
    ],
    "afternoon": [
        {"time": "12:00", "isAvailable": true},
        {"time": "12:15", "isAvailable": true},
        {"time": "12:30", "isAvailable": true},
        {"time": "12:45", "isAvailable": true},
        {"time": "1:00", "isAvailable": true},
        {"time": "1:15", "isAvailable": true},
        {"time": "1:30", "isAvailable": true},
        {"time": "1:45", "isAvailable": true},
        {"time": "2:00", "isAvailable": true},
        {"time": "2:15", "isAvailable": true},
        {"time": "2:30", "isAvailable": true},
        {"time": "2:45", "isAvailable": true},
        {"time": "3:00", "isAvailable": true},
        {"time": "3:15", "isAvailable": true},
        {"time": "3:30", "isAvailable": true},
        {"time": "3:45", "isAvailable": true},
        {"time": "4:00", "isAvailable": true},
        {"time": "4:15", "isAvailable": true},
        {"time": "4:30", "isAvailable": true},
        {"time": "4:45", "isAvailable": true}
    ],
    "evening": [
        {"time": "5:00", "isAvailable": true},
        {"time": "5:15", "isAvailable": true},
        {"time": "5:30", "isAvailable": true},
        {"time": "5:45", "isAvailable": true},
        {"time": "6:00", "isAvailable": true},
        {"time": "6:15", "isAvailable": true},
        {"time": "6:30", "isAvailable": true},
        {"time": "6:45", "isAvailable": true},
        {"time": "7:00", "isAvailable": true},
        {"time": "7:15", "isAvailable": true},
        {"time": "7:30", "isAvailable": true},
        {"time": "7:45", "isAvailable": true},
        {"time": "8:00", "isAvailable": true},
        {"time": "8:15", "isAvailable": true},
        {"time": "8:30", "isAvailable": true},
        {"time": "8:45", "isAvailable": true}
    ]
}


const currency = {
    USD: "usd",
}


var obj = {
    messages: messages,
    distance: distance,
    timeSlots: timeSlots,
    offTimeSlots:offTimeSlots,
    currency: currency
};


module.exports = obj;