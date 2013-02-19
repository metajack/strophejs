/** Class: Strophe.Authentication.PLAIN
 * SASL PLAIN Authentication implementation
 */
Strophe.Authentication.PLAIN = function() {
};

/** Function: init
 * Initializes the PLAIN Authentication mechanism
 */
Strophe.Authentication.PLAIN.prototype.init = function(connection) {
	this._connection = connection;
	this._data = {};
	this._successHandler = null;
	this._failureHandler = null;
};

/** Function: authenticate
 * Called after chosing PLAIN as the mechanism.
 */
Strophe.Authentication.PLAIN.prototype.authenticate = function() {
	// Build the plain auth string (barejid null
    // username null password) and base 64 encoded.
    auth_str = Strophe.getBareJidFromJid(this._connection.jid);
    auth_str = auth_str + "\u0000";
    auth_str = auth_str + Strophe.getNodeFromJid(this._connection.jid);
    auth_str = auth_str + "\u0000";
    auth_str = auth_str + this._connection.pass;

    this._successHandler = this._connection._addSysHandler(
        this.successCb.bind(this), null,
        "success", null, null);
    this._failureHandler = this._connection._addSysHandler(
        this.failureCb.bind(this), null,
        "failure", null, null);

    hashed_auth_str = Base64.encode(auth_str);
    this._connection.send($build("auth", {
        xmlns: Strophe.NS.SASL,
        mechanism: "PLAIN"
    }).t(hashed_auth_str).tree());
};

/** PrivateFunction: successCb
 * Callback after succesful authentication
 *
 *  Parameters:
 *    (XMLElement) elem - The success stanza.
 *
 *  Returns:
 *    false to remove the handler (by calling <Strophe.Connection._sasl_success_cb()>)
 */
Strophe.Authentication.PLAIN.prototype.successCb = function(elem) {
    if (this._failureHandler) {
        this._connection.deleteHandler(this._failureHandler);
        this._failureHandler = null;
    }
    return this._connection._sasl_success_cb();
};

/** PrivateFunction: failureCb
 * Callback after failed authentication
 *
 *  Parameters:
 *    (XMLElement) elem - The failure stanza.
 *
 *  Returns:
 *    false to remove the handler (by calling <Strophe.Connection._sasl_failure_cb()>)
 */
Strophe.Authentication.PLAIN.prototype.failureCb = function(elem) {
    if (this._successHandler) {
        this._connection.deleteHandler(this._successHandler);
        this._successHandler = null;
    }
    return this._connection._sasl_failure_cb();
};

Strophe.addMechanismPlugin('PLAIN', Strophe.Authentication.PLAIN.prototype);