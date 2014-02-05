/** Class: Strophe.Authentication.ANONYMOUS
 * SASL ANONYMOUS Authentication implementation
 */
Strophe.Authentication.ANONYMOUS = function() {
};

/** Function: init
 * Initializes the ANONYMOUS Authentication mechanism
 */
Strophe.Authentication.ANONYMOUS.prototype.init = function(connection) {
	this._connection = connection;
	this._successHandler = null;
	this._failureHandler = null;
};

/** Function: authenticate
 * Called after chosing ANONYMOUS as the mechanism.
 */
Strophe.Authentication.ANONYMOUS.prototype.authenticate = function() {
	this._successHandler = this._connection._addSysHandler(
		this.successCb.bind(this), null,
		"success", null, null);
	this._failureHandler = this._connection._addSysHandler(
		this.failureCb.bind(this), null,
		"failure", null, null);

	this._connection.send($build("auth", {
		xmlns: Strophe.NS.SASL,
		mechanism: "ANONYMOUS"
    }).tree());
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
Strophe.Authentication.ANONYMOUS.prototype.successCb = function(elem) {
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
Strophe.Authentication.ANONYMOUS.prototype.failureCb = function(elem) {
	if (this._successHandler) {
        this._connection.deleteHandler(this._successHandler);
        this._successHandler = null;
    }
	return this._connection._sasl_failure_cb();
};

Strophe.addMechanismPlugin('ANONYMOUS', Strophe.Authentication.ANONYMOUS.prototype);