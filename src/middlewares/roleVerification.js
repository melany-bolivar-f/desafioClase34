/**
 * The function `isAdmin` checks if the user in the session has an 'admin' role and allows access or
 * sends a 403 status code if not.
 */
function isAdmin(req, res, next) {
    if (req.session.user && req.session.user.role === 'admin') {
        next()
    } else {
        res.status(403).send('Acceso prohibido')
    }
}

/**
 * The function `isUser` checks if the user in the session has the role of 'user' and allows access or
 * sends a 403 status code if not.
 */
function isUser(req, res, next) {
    if (req.session.user && req.session.user.role === 'user') {
        next()
    } else {
        res.status(403).send('Acceso prohibido')
    }
}

module.exports = {
    isAdmin,
    isUser
}