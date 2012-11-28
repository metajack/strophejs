require([
    '../src/base64', 
    '../src/md5', 
    '../src/sha1'
], 
function(Base64, MD5, SHA1)
{
    test("Base64", 3, function()
    {
        equal(typeof Base64, 'object');
        equal(typeof Base64.decode, 'function');
        equal(typeof Base64.encode, 'function');
    });
    
    test("MD5", 8, function()
    {
        equal(typeof MD5, 'object');
        equal(typeof MD5.hexdigest, 'function');
        equal(typeof MD5.b64digest, 'function');
        equal(typeof MD5.hash, 'function');
        equal(typeof MD5.hmac_hexdigest, 'function');
        equal(typeof MD5.hmac_b64digest, 'function');
        equal(typeof MD5.hmac_hash, 'function');
        equal(typeof MD5.test, 'function');
    });
    
    test("SHA1", 10, function()
    {
       equal(typeof SHA1, 'object');
       equal(typeof SHA1.hex_sha1, 'function');
       equal(typeof SHA1.b64_sha1, 'function');
       equal(typeof SHA1.str_sha1, 'function');
       equal(typeof SHA1.hex_hmac_sha1, 'function');
       equal(typeof SHA1.b64_hmac_sha1, 'function');
       equal(typeof SHA1.str_hmac_sha1, 'function');
       equal(typeof SHA1.sha1_vm_test, 'function');
       equal(typeof SHA1.core_hmac_sha1, 'function');
       equal(typeof SHA1.binb2str, 'function');
    });
});