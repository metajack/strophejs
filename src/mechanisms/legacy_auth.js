/** Class: Strophe.Authentication.LEGACY_AUTH
 * Legacy authentication implementation
 */
Strophe.Authentication.LEGACY_AUTH = function() {
};

/** Function: init
 * Initializes the legacy authentication mechanism
 */
Strophe.Authentication.LEGACY_AUTH.prototype.init = function(connection) {
	this._connection = connection;
	this.matches = false;
	this._data = {};
	this._auth1Handler = null;
};

/** Function: authenticate
 * Called after chosing legacy authentication as the mechanism.
 */
Strophe.Authentication.LEGACY_AUTH.prototype.authenticate = function() {
	this._auth1Handler = this._connection._addSysHandler(this.auth1Cb.bind(this), null, null,
		null, "_auth_1");

    this._connection.send($iq({
        type: "get",
        to: this._connection.domain,
        id: "_auth_1"
    }).c("query", {
        xmlns: Strophe.NS.AUTH
    }).c("username", {}).t(Strophe.getNodeFromJid(this._connection.jid)).tree());
};

/** PrivateFunction: auth1Cb
 *  _Private_ handler for legacy authentication.
 *
 *  This handler is called in response to the initial <iq type='get'/>
 *  for legacy authentication.  It builds an authentication <iq/> and
 *  sends it, creating a handler (calling back to _auth2_cb()) to
 *  handle the result
 *
 *  Parameters:
 *    (XMLElement) elem - The stanza that triggered the callback.
 *
 *  Returns:
 *    false to remove the handler.
 */
Strophe.Authentication.LEGACY_AUTH.prototype.auth1Cb = function(elem) {
    // build LEGACY_AUTHtext auth iq
    var iq = $iq({type: "set", id: "_auth_2"})
        .c('query', {xmlns: Strophe.NS.AUTH})
        .c('username', {}).t(Strophe.getNodeFromJid(this._connection.jid))
        .up()
        .c('password').t(this._connection.pass);

    if (!Strophe.getResourceFromJid(this._connection.jid)) {
        // since the user has not supplied a resource, we pick
        // a default one here.  unlike other auth methods, the server
        // cannot do this for us.
        this._connection.jid = Strophe.getBareJidFromJid(this._connection.jid) + '/strophe';
    }
    iq.up().c('resource', {}).t(Strophe.getResourceFromJid(this._connection.jid));

    this._connection._addSysHandler(this.auth2Cb.bind(this), null,
                        null, null, "_auth_2");

    this._connection.send(iq.tree());

    return false;
};

/** PrivateFunction: auth2Cb
 * _Private_ handler to finish legacy authentication.
 *
 * This handler is called when the result from the jabber:iq:auth
 * <iq/> stanza is returned.
 *
 * Parameters:
 *     (XMLElement) elem - The stanza that triggered the callback.
 *
 * Returns:
 *     false to remove the handler.
*/
Strophe.Authentication.LEGACY_AUTH.prototype.auth2Cb = function(elem) {
    if (elem.getAttribute("type") == "result") {
        this._connection.authenticated = true;
        this._connection._changeConnectStatus(Strophe.Status.CONNECTED, null);
    } else if (elem.getAttribute("type") == "error") {
        this._connection._changeConnectStatus(Strophe.Status.AUTHFAIL, null);
        this._connection.disconnect();
    }
    return false;
}

Strophe.addMechanismPlugin('LEGACY_AUTH', Strophe.Authentication.LEGACY_AUTH.prototype);