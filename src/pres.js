/** Function: $pres
 *  Create a Strophe.Builder with a <presence/> element as the root.
 *
 *  Parameters:
 *    (Object) attrs - The <presence/> element attributes in object notation.
 *
 *  Returns:
 *    A new Strophe.Builder object.
 */
(function (root, factory) {
    if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        define(['Strophe'], factory);
    } else {
        // Browser globals
        root.$pres = factory(root.Strophe);
    }
}(this, function (Strophe) {    
    return function (attrs) { return new Strophe.Builder("presence", attrs); }
}));