require(['../src/base64', '../src/md5'], function(Base64, MD5)
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
});