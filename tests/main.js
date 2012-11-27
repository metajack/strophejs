require(['../src/base64'], function(Base64)
{
    test("Base64", 3, function()
    {
        equal(typeof Base64, 'object');
        equal(typeof Base64.decode, 'function');
        equal(typeof Base64.encode, 'function');
    });
});