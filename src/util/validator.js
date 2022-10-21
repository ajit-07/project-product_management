import mongoose from 'mongoose';

//---------------------------------name------------------------------------->
const isValidName = (name) => {
    if ((typeof name == "string" && name.trim().length != 0 && name.match(/^[A-Z a-z]{2,}$/)))
        return true
    return false
};

//---------------------------isValidEmail--------------------------->
const isValidEmail = (email) => {
    const regex = /^([a-zA-Z0-9_.]+@[a-z]+\.[a-z]{2,3})?$/.test(email)
    // if (/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(mail))
    return regex
};

//---------------------isValidFile------------------>
const isValidFile = (img) => {
    const regex = /(\/*\.(?:png|gif|webp|jpeg|jpg))/.test(img)
    return regex
}
//-------------------------------------isValidPwd------------------------------------->
const isValidPass = (password) => {
    const regex = /^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{8,15}$/.test(password)
    return regex
};

//----------------------isValidNumber----------------------->
const isValidNumber = (phone) => {
    // let regex = /^[6-9]{1}[0-9]{9}$/.test(phone)
    let regex = /^(\+91[\-\s]?)?[0]?(91)?[6789]\d{9}$/.test(phone)
    return regex
};

//---------------------------isValidTxt-------------------------->
const isValidTxt = (txt) => {
    const regex = /^[A-Za-z0-9 ]{2,}$/.test(txt)
    return regex
}

//----------------------isValidNumber----------------------->
const isValidPin = (pin) => {
    let regex = /^[1-9]{1}[0-9]{5}$/.test(pin)
    return regex
};

//----------------------objectId----------------------->
const isValidObjectId = (objectId) => {
    return mongoose.Types.ObjectId.isValid(objectId)
}



const isValid = (value) => {
    if (typeof value === "undefined" || typeof value === null) { return false }
    if (typeof value === "string" && value.trim().length === 0) { return false }
    return true
}

const isValidPrice = (value) => {
    return /^[1-9]\d{0,7}(?:\.\d{1,4})?$/.test(value)
}

const isBoolean = (value) => {
    if (value == "true" || value == "false") { return true }
    return false
}

const isValidString = (value) => {
    if (typeof value === "undefined" || typeof value === "null" || typeof value === "number") return false
    if (typeof value === "string" && value.trim().length === 0) return false
    return true
}
const isValidIncludes=function(value,requestBody){
    return Object.keys(requestBody).includes(value)
} 


export { isValidIncludes,isValidName, isValidEmail, isValidFile, isValidPass, isValidNumber, isValidTxt, isValidPin, isValidObjectId, isValid, isValidPrice, isBoolean, isValidString };
