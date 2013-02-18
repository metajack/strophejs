/** Class: Strophe.Authentication.SCRAM_SHA1
 * SASL SCRAM-SHA-1 Authentication implementation
 */
Strophe.Authentication.SCRAM_SHA1 = function() {
};

/** Function: init
 * Initializes the SCRAM-SHA-1 Authentication mechanism
 */
Strophe.Authentication.SCRAM_SHA1.prototype.init = function(connection) {
	this._connection = connection;
	this.matches = false;
	this._data = {};
	this._successHandler = null;
	this._challengeHandler = null;
	this._failureHandler = null;
};

/** Function: authenticate
 * Called after chosing SCRAM-SHA-1 as the mechanism.
 */
Strophe.Authentication.SCRAM_SHA1.prototype.authenticate = function() {
	this._challengeHandler = this._connection._addSysHandler(
		this.challengeCb.bind(this), null,
		"challenge", null, null);
	this._failureHandler = this._connection._addSysHandler(
		this.failureCb.bind(this), null,
		"failure", null, null);

    var cnonce = MD5.hexdigest(Math.random() * 1234567890);

    var auth_str = "n=" + Strophe.getNodeFromJid(this._connection.jid);
    auth_str += ",r=";
    auth_str += cnonce;

    this._data["cnonce"] = cnonce;
    this._data["client-first-message-bare"] = auth_str;

    auth_str = "n,," + auth_str;

    this._connection.send($build("auth", {
        xmlns: Strophe.NS.SASL,
        mechanism: "SCRAM-SHA-1"
    }).t(Base64.encode(auth_str)).tree());
};

/** PrivateFunction: challengeCb
 *  _Private_ handler for SCRAM-SHA-1 SASL authentication.
 *
 *  Parameters:
 *    (XMLElement) elem - The challenge stanza.
 *
 *  Returns:
 *    false to remove the handler.
 */
Strophe.Authentication.SCRAM_SHA1.prototype.challengeCb = function(elem) {
    var nonce, salt, iter, Hi, U, U_old, i, k;
    var clientKey, serverKey, clientSignature;
    var responseText = "c=biws,";
    var challenge = Base64.decode(Strophe.getText(elem));
    var authMessage = this._data["client-first-message-bare"] + "," +
        challenge + ",";
    var cnonce = this._data["cnonce"]
    var attribMatch = /([a-z]+)=([^,]+)(,|$)/;

    // remove unneeded handlers
    this._connection.deleteHandler(this._failureHandler);

    while (challenge.match(attribMatch)) {
        matches = challenge.match(attribMatch);
        challenge = challenge.replace(matches[0], "");
        switch (matches[1]) {
        case "r":
            nonce = matches[2];
            break;
        case "s":
            salt = matches[2];
            break;
        case "i":
            iter = matches[2];
            break;
        }
    }

    if (!(nonce.substr(0, cnonce.length) === cnonce)) {
        this._data = {};
        return this.failureCb(null);
    }

    responseText += "r=" + nonce;
    authMessage += responseText;

    salt = Base64.decode(salt);
    salt += "\0\0\0\1";

    Hi = U_old = core_hmac_sha1(this._connection.pass, salt);
    for (i = 1; i < iter; i++) {
        U = core_hmac_sha1(this._connection.pass, binb2str(U_old));
        for (k = 0; k < 5; k++) {
            Hi[k] ^= U[k];
        }
        U_old = U;
    }
    Hi = binb2str(Hi);

    clientKey = core_hmac_sha1(Hi, "Client Key");
    serverKey = str_hmac_sha1(Hi, "Server Key");
    clientSignature = core_hmac_sha1(str_sha1(binb2str(clientKey)), authMessage);
    this._data["server-signature"] = b64_hmac_sha1(serverKey, authMessage);

    for (k = 0; k < 5; k++) {
        clientKey[k] ^= clientSignature[k];
    }

    responseText += ",p=" + Base64.encode(binb2str(clientKey));

    this._successHandler = this._connection._addSysHandler(
        this.successCb.bind(this), null,
        "success", null, null);
    this._failureHandler = this._connection._addSysHandler(
        this.failureCb.bind(this), null,
        "failure", null, null);

    this._connection.send($build('response', {
        xmlns: Strophe.NS.SASL
    }).t(Base64.encode(responseText)).tree());

    return false;
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
Strophe.Authentication.SCRAM_SHA1.prototype.successCb = function(elem) {
    var serverSignature;
    var success = Base64.decode(Strophe.getText(elem));
    var attribMatch = /([a-z]+)=([^,]+)(,|$)/;
    matches = success.match(attribMatch);
    if (matches[1] == "v") {
        serverSignature = matches[2];
    }
    if (serverSignature != this._data["server-signature"]) {
        // remove old handlers
        this._connection.deleteHandler(this._failureHandler);
        this._failureHandler = null;
        if (this._challengeHandler) {
            this._connection.deleteHandler(this._challengeHandler);
            this._challengeHandler = null;
        }

        this._data = {};
        return this.failureCb(null);
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
Strophe.Authentication.SCRAM_SHA1.prototype.failureCb = function(elem) {
    if (this._successHandler) {
        this._connection.deleteHandler(this._successHandler);
        this._successHandler = null;
    }
    if (this._challengeHandler) {
        this._connection.deleteHandler(this._challengeHandler);
        this._challengeHandler = null;
    }
    return this._connection._sasl_failure_cb();
};

Strophe.addMechanismPlugin('SCRAM-SHA-1', Strophe.Authentication.SCRAM_SHA1.prototype);