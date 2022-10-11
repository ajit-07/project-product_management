import mongoose from 'mongoose';

const isValid = (value) => {
    if (!value) return false
    if (typeof value !== "String" || value.trim.length === 0) return false;
    return true
}

const isValidEmail = (value) => {
    return (/^([a-z0-9\._]+){3,}@([a-zA-Z0-9])+.([a-z]){2,6}(.[a-z]+)?$/.test(value))
}

const isValidPassword = (value) => {
    return (/^(?=.[0-9])(?=.[a-z])(?=.[A-Z])(?=.[@#$%&])[a-zA-Z0-9@#$%&]{8,15}$/.test(value))
}

export { isValidEmail, isValidPassword, isValid }


