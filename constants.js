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
    "email": "hello@barbrdo.com",
    "emailsend" : "Thank you! Your feedback has been submitted"
}

const distance = {
    "shopDistance": 500000,
    "distanceMultiplierInMiles": 0.000621371,
    "distanceMultiplierInkm": 0.001
}

const offTimeSlots = [10,20,30,45]

const currency = {
    USD: "usd",
}

const appleUrl = {
    url : "https://itunes.apple.com/us/app/keynote/id361285480?mt=8"
}

const androidUrl = {
    url : "https://play.google.com/store/apps/dev?id=5700313618786177705"
}

const barbermailId = {
    mail : "hello@barbrdo.com"
}

const textToCustomers = {
    text:"Welcome to BarbrDo.  Save time! Get our free BarbrDo App, the easiest way to get your haircut when you want it. "
}
const textToBarbers = {
    text:"Welcome to BarbrDo!  Having a slow day at the shop?  Use our App to grow your business and attract new customers! "
}

var obj = {
    messages: messages,
    distance: distance,
    offTimeSlots:offTimeSlots,
    currency: currency,
    appleUrl:appleUrl,
    androidUrl:androidUrl,
    barbermailId:barbermailId,
    textToCustomers:textToCustomers,
    textToBarbers:textToBarbers
};


module.exports = obj;
