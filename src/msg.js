/** Function: $msg
 *  Create a Strophe.Builder with a <message/> element as the root.
 *
 *  Parmaeters:
 *    (Object) attrs - The <message/> element attributes in object notation.
 *
 *  Returns:
 *    A new Strophe.Builder object.
 */
(function (root, factory) {
    if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        define(['Strophe'], function(Strophe) {
            // But also create global
            return (root.$msg = factory(root.Strophe));
        });
    } else {
        // Browser globals
        root.$msg = factory(root.Strophe);
    }
}(this, function (Strophe) {
    return function (attrs) { return new Strophe.Builder("message", attrs); };
}));