exports.newFoundationsUtilitiesEncryption = function () {

    let thisObject = {
        randomPassword: randomPassword,
        encrypt: encrypt,
        decrypt: decrypt
    }

    const crypto = require('crypto')
    const algorithm = 'aes-256-ctr'
    const IV_LENGTH = 16

    return thisObject

    function randomPassword() {
        let password = Math.random().toString(36).substr(2,32) + Math.random().toString(36).substr(2,32) + Math.random().toString(36).substr(2,32)
        return password.substr(0, 32)
    }

    function encrypt(text, password) {
        const iv = crypto.randomBytes(IV_LENGTH)
        const cipher = crypto.createCipheriv(algorithm, Buffer.concat([Buffer.from(password), Buffer.alloc(32)], 32), iv)
        let encrypted = cipher.update(text)
        encrypted = Buffer.concat([encrypted, cipher.final()])
        return iv.toString('hex') + ':' + encrypted.toString('hex')
    }

    function decrypt(text, password) {
        const textParts = text.split(':')
        const iv = Buffer.from(textParts.shift(), 'hex')
        let encryptedText = Buffer.from(textParts.join(':'), 'hex')
        let decipher = crypto.createDecipheriv(algorithm, Buffer.concat([Buffer.from(password), Buffer.alloc(32)], 32), iv)
        let decrypted = decipher.update(encryptedText)
        decrypted = Buffer.concat([decrypted, decipher.final()])
        return decrypted.toString()
    }
}