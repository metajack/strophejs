/** Function: $build
 *  Create a Strophe.Builder.
 *  This is an alias for 'new Strophe.Builder(name, attrs)'.
 *
 *  Parameters:
 *    (String) name - The root element name.
 *    (Object) attrs - The attributes for the root element in object notation.
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
        root.$build = factory(root.Strophe);
    }
}(this, function (Strophe) {    
    return function (name, attrs) { return new Strophe.Builder(name, attrs); }
}));