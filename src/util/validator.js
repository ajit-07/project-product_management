const isValidField = (value) => {
    if (!value || value === "") { return false }
    if (typeof value === "undefined" || typeof value === "null") { return false }
    if (typeof value === "string" && value.trim().length === 0) { return false }
    if(typeof value ==="object" && Object.keys(value).length===0) {return false}
    return true
}

const isValidName = (name) => {
    const regex = /^[A-Z a-z]{2,}$/.test(name)
    return regex
};

const isValidEmail = (email) => {
    const regex = /^([a-zA-Z0-9_.]+@[a-z]+\.[a-z]{2,3})?$/.test(email)
    // if (/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(mail))
    return regex
};

const isValidFile = (img) => {
    const regex = /(\/*\.(?:png|gif|webp|jpeg|jpg))/.test(img)
    return regex
}

const isValidPass = (password) => {
    const regex = /^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{8,15}$/.test(password)
    return regex
};


const isValidNumber = (phone) => {
    // let regex = /^[6-9]{1}[0-9]{9}$/.test(phone)
    let regex = /^(\+91[\-\s]?)?[0]?(91)?[6789]\d{9}$/.test(phone)
    return regex
};


const isValidTxt = (txt) => {
    const regex = /^[A-Za-z0-9 ]{2,}$/.test(txt)
    return regex
}


const isValidPin = (pin) => {
    let regex = /^[1-9]{1}[0-9]{5}$/.test(pin)
    return regex
};



const isValidPrice = (value) => {
    return /^[1-9]\d{0,7}(?:\.\d{1,4})?$/.test(value)
}

const isBoolean = (value) => {
    if (value == "true" || value == "false") { return true }
    return false
}


export { isValidName, isValidEmail, isValidFile, isValidPass, isValidNumber, isValidTxt, isValidPin, isValidPrice, isBoolean, isValidField };
