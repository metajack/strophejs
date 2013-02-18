/** Class: Strophe.Authentication.DIGEST_MD5
 * SASL DIGEST-MD5 Authentication implementation
 */
Strophe.Authentication.DIGEST_MD5 = function() {
};

/** Function: init
 * Initializes the DIGEST-MD5 Authentication mechanism
 */
Strophe.Authentication.DIGEST_MD5.prototype.init = function(connection) {
	this._connection = connection;
	this.matches = false;
	this._data = {};
	this._successHandler = null;
	this._challengeHandler = null;
	this._failureHandler = null;
};

/** Function: authenticate
 * Called after chosing DIGEST-MD5 as the mechanism.
 */
Strophe.Authentication.DIGEST_MD5.prototype.authenticate = function() {
    this._challengeHandler = this._connection._addSysHandler(
        this.challengeCb.bind(this), null,
        "challenge", null, null);
    this._failureHandler = this._connection._addSysHandler(
        this.failureCb.bind(this), null,
        "failure", null, null);

    this._connection.send($build("auth", {
        xmlns: Strophe.NS.SASL,
        mechanism: "DIGEST-MD5"
    }).tree());
};

/** PrivateFunction: challengeCb
 *  _Private_ handler for DIGEST-MD5 SASL authentication.
 *
 *  Parameters:
 *    (XMLElement) elem - The challenge stanza.
 *
 *  Returns:
 *    false to remove the handler.
 */
Strophe.Authentication.DIGEST_MD5.prototype.challengeCb = function(elem) {
    var attribMatch = /([a-z]+)=("[^"]+"|[^,"]+)(?:,|$)/;

    var challenge = Base64.decode(Strophe.getText(elem));
    var cnonce = MD5.hexdigest("" + (Math.random() * 1234567890));
    var realm = "";
    var host = null;
    var nonce = "";
    var qop = "";
    var matches;

    // remove unneeded handlers
    this._connection.deleteHandler(this._failureHandler);

    while (challenge.match(attribMatch)) {
        matches = challenge.match(attribMatch);
        challenge = challenge.replace(matches[0], "");
        matches[2] = matches[2].replace(/^"(.+)"$/, "$1");
        switch (matches[1]) {
        case "realm":
            realm = matches[2];
            break;
        case "nonce":
            nonce = matches[2];
            break;
        case "qop":
            qop = matches[2];
            break;
        case "host":
            host = matches[2];
            break;
        }
    }

    var digest_uri = "xmpp/" + this._connection.domain;
    if (host !== null) {
        digest_uri = digest_uri + "/" + host;
    }

    var A1 = MD5.hash(Strophe.getNodeFromJid(this._connection.jid) +
                      ":" + realm + ":" + this._connection.pass) +
        ":" + nonce + ":" + cnonce;
    var A2 = 'AUTHENTICATE:' + digest_uri;

    var responseText = "";
    responseText += 'username=' +
        this._connection._quote(Strophe.getNodeFromJid(this._connection.jid)) + ',';
    responseText += 'realm=' + this._connection._quote(realm) + ',';
    responseText += 'nonce=' + this._connection._quote(nonce) + ',';
    responseText += 'cnonce=' + this._connection._quote(cnonce) + ',';
    responseText += 'nc="00000001",';
    responseText += 'qop="auth",';
    responseText += 'digest-uri=' + this._connection._quote(digest_uri) + ',';
    responseText += 'response=' + this._connection._quote(
        MD5.hexdigest(MD5.hexdigest(A1) + ":" +
                      nonce + ":00000001:" +
                      cnonce + ":auth:" +
                      MD5.hexdigest(A2))) + ',';
    responseText += 'charset="utf-8"';

    this._challengeHandler = this._connection._addSysHandler(
        this.challengeCb2.bind(this), null,
        "challenge", null, null);
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


/** PrivateFunction: challengeCb2
 *  _Private_ handler for second step of DIGEST-MD5 SASL authentication.
 *
 *  Parameters:
 *    (XMLElement) elem - The challenge stanza.
 *
 *  Returns:
 *    false to remove the handler.
 */
Strophe.Authentication.DIGEST_MD5.prototype.challengeCb2 = function(elem) {
    // remove unneeded handlers
    this._connection.deleteHandler(this._successHandler);
    this._connection.deleteHandler(this._failureHandler);

    this._successHandler = this._connection._addSysHandler(
        this.successCb.bind(this), null,
        "success", null, null);
    this._failureHandler = this._connection._addSysHandler(
        this.failureCb.bind(this), null,
        "failure", null, null);

    this._connection.send($build('response', {
        xmlns: Strophe.NS.SASL
    }).tree());
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
Strophe.Authentication.DIGEST_MD5.prototype.successCb = function(elem) {
    if (this._challengeHandler) {
        this._connection.deleteHandler(this._challengeHandler);
        this._challengeHandler = null;
    }
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
Strophe.Authentication.DIGEST_MD5.prototype.failureCb = function(elem) {
    if (this._challengeHandler) {
        this._connection.deleteHandler(this._challengeHandler);
        this._challengeHandler = null;
    }
    if (this._successHandler) {
        this._connection.deleteHandler(this._successHandler);
        this._successHandler = null;
    }
    return this._connection._sasl_failure_cb();
};

Strophe.addMechanismPlugin('DIGEST-MD5', Strophe.Authentication.DIGEST_MD5.prototype);