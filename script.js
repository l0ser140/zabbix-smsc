var Smsc = {
    login: null,
    password: null,
    phones: null,
    message: null,
    sender: null,
    call: null,
    param: null,
    voice: null,
    proxy: null,

    sendMessage: function() {
        var params = {
            login: Smsc.login,
            psw: Smsc.password,
            phones: Smsc.phones,
            mes: Smsc.message,
            fmt: 3
        },
        response,
        request = new CurlHttpRequest(),
        url = 'https://smsc.ru/sys/send.php';

        if (Smsc.sender !== null) {
            params['sender'] = Smsc.sender;
        }
        if (Smsc.call !== null) {
            params['call'] = Smsc.call;
        }
        if (Smsc.param !== null) {
            params['param'] = Smsc.param;
        }
        if (Smsc.voice !== null) {
            params['voice'] = Smsc.voice;
        }
        if (Smsc.proxy) {
            request.setProxy(Smsc.proxy);
        }

        request.AddHeader('Content-Type: application/json');
        var query = Object.keys(params).map(function(key) {
            return key + '=' + params[key]
        }).join('&');
        url = url + '?' + query;
        // Remove replace() function if you want to see the exposed password in the log file.
        Zabbix.Log(4, '[SMSC Webhook] URL: ' + url.replace(Smsc.password, '<PASSWORD>'));
        response = request.Post(url);
        Zabbix.Log(4, '[SMSC Webhook] HTTP code: ' + request.Status());

        try {
            response = JSON.parse(response);
        }
        catch (error) {
            response = null;
        }

        if (request.Status() !== 200 || typeof response.error_code !== "undefined") {
            if (typeof response.error === 'string') {
                throw response.error;
            }
            else {
                throw 'Unknown error. Check debug log for more information.'
            }
        }
    }
}
try {
    var params = JSON.parse(value);

    if (typeof params.Login === 'undefined') {
        throw 'Incorrect value is given for parameter "Login": parameter is missing';
    }
    Smsc.login = params.Login;

    if (typeof params.Password === 'undefined') {
        throw 'Incorrect value is given for parameter "Password": parameter is missing';
    }
    Smsc.password = params.Password;

    if (typeof params.To === 'undefined') {
        throw 'Incorrect value is given for parameter "Phone": parameter is missing';
    }
    Smsc.phones = params.To;

    if (['0','1'].indexOf(params.Call) !== -1) {
        Smsc.call = params.Call;
    }

    if (params.Sender) {
        Smsc.sender = params.Sender;
    }

    if (params.Param) {
        Smsc.param = params.Param;
    }

    if (params.Voice) {
        Smsc.voice = params.Voice;
    }

    if (params.HTTPProxy) {
        Smsc.proxy = params.HTTPProxy;
    }

    Smsc.message = params.Message;
    Smsc.sendMessage();

    return 'OK';
}
catch (error) {
    Zabbix.Log(4, '[SMSC Webhook] notification failed: ' + error);
    throw 'Sending failed: ' + error + '.';
}