requirejs.config({
    paths: {
        Base64: '../src/base64',
        domReady: '../vendor/domReady',
        jquery: 'https://ajax.googleapis.com/ajax/libs/jquery/1.8.3/jquery.min',
        MD5: '../src/md5',
        SHA1: '../src/sha1',
        Strophe: '../src/core',
        $build: '../src/build',
        $iq: '../src/iq',
        $msg: '../src/msg',
        $pres: '../src/pres'
    }
});

require([
    'jquery',
    'domReady',
    'Strophe',
], 
function($, domReady, Strophe) {
    var BOSH_SERVICE = '/http-bind/';
    
    var onConnect = function (status) 
    {
        if (status == Strophe.Status.CONNECTING) {
            log('Strophe is connecting.');
        } else if (status == Strophe.Status.CONNFAIL) {
            log('Strophe failed to connect.');
            $('#connect').get(0).value = 'connect';
        } else if (status == Strophe.Status.DISCONNECTING) {
            log('Strophe is disconnecting.');
        } else if (status == Strophe.Status.DISCONNECTED) {
            log('Strophe is disconnected.');
            $('#connect').get(0).value = 'connect';
        } else if (status == Strophe.Status.CONNECTED) {
            log('Strophe is connected.');
            connection.disconnect();
        }
    }
    
    var log = function (msg) 
    {
        $('#log').append('<div></div>').append(document.createTextNode(msg));
    }

    var rawInput = function (data)
    {
        log('RECV: ' + data);
    }

    var rawOutput = function (data)
    {
        log('SENT: ' + data);
    }
    
    var connection = new Strophe.Connection(BOSH_SERVICE);
    connection.rawInput = rawInput;
    connection.rawOutput = rawOutput;
    
    domReady(function () {
        $('#connect').bind('click', function () {
            var button = $('#connect').get(0);
            if (button.value == 'connect') {
                button.value = 'disconnect';

                connection.connect($('#jid').get(0).value,
                           $('#pass').get(0).value,
                           onConnect);
            } else {
                button.value = 'connect';
                connection.disconnect();
            }
        });
    });
});