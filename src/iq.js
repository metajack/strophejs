/** Function: $iq
 *  Create a Strophe.Builder with an <iq/> element as the root.
 *
 *  Parameters:
 *    (Object) attrs - The <iq/> element attributes in object notation.
 *
 *  Returns:
 *    A new Strophe.Builder object.
 */
(function (root, factory) {
    if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        define(['Strophe'], function(Strophe) {
            // But also create global
            return (root.$iq = factory(root.Strophe));
        });
    } else {
        // Browser globals
        root.$iq = factory(root.Strophe);
    }
}(this, function (Strophe) {
    return function (attrs) { return new Strophe.Builder("iq", attrs); };
}));