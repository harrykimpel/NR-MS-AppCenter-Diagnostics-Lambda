const https = require('https');
const msAppCenterOwnerName = process.env.msAppCenterOwnerName;
const msAppCenterAppName = process.env.msAppCenterAppName;
const msAppCenterAPIToken = process.env.msAppCenterAPIToken;
const nrAccountId = process.env.nrAccountId;
const nrInsightsAPIKey = process.env.nrInsightsAPIKey;

var optionsInsights = {
    host: 'insights-collector.newrelic.com',
    headers: {
        'Content-Type': 'application/json',
        'X-Insert-Key': nrInsightsAPIKey
    },
    method: 'POST',
    port: 443,
    path: '/v1/accounts/' + nrAccountId + '/events'
};

exports.handler =  (event) => {
    
var sendToInsights = function (insightsEvent, insightsCb) {
    var request = https.request(optionsInsights, function (resp) {
        console.log('statusCode:', resp.statusCode);
        //console.log('headers:', resp.headers);
        resp.setEncoding('utf8');
        var body = '';
        resp.on('data', function (chunk) {
            //console.log('chunk: ' + chunk)
            body += chunk;
        });
        resp.on('end', function () {
            console.log('insights response: ', body);
            insightsCb(null);
        });
    }).on('error', function (error) {
        console.log(`Got error sending data to insights: ${error.message}`);
        insightsCb(error.message);
    });

    request.write(JSON.stringify(insightsEvent));
    request.end();
};

var options = {
    host: 'api.appcenter.ms',
    port: 443,
    path: '/v0.1/apps/' + msAppCenterOwnerName + '/' + msAppCenterAppName + '/errors/errorGroups',
    method: 'GET',
    headers: {
        'X-API-Token': msAppCenterAPIToken,
        'Accept': 'application/json'
    }
};

https.request(options, function (res) {
    console.log('STATUS: ' + res.statusCode);
    //console.log('HEADERS: ' + JSON.stringify(res.headers));
    res.on('data', function (chunk) {
        //console.log('BODY: ' + chunk);
        var json = JSON.parse(chunk);
        json.errorGroups.forEach(result => {
            console.log('result: ' + result.errorGroupId);

            var insightsEvent = [
                {
                    eventType: 'MicrosoftAppCenterErrorGroups',
                    errorGroupId: result.errorGroupId,
                    appVersion: result.appVersion,
                    appBuild: result.appBuild,
                    count: result.count,
                    deviceCount: result.deviceCount,
                    firstOccurrence: result.firstOccurrence,
                    lastOccurrence: result.lastOccurrence,
                    exceptionType: result.exceptionType,
                    exceptionMessage: result.exceptionMessage,
                    exceptionClassName: result.exceptionClassName,
                    exceptionClassMethod: result.exceptionClassMethod,
                    exceptionMethod: result.exceptionMethod,
                    exceptionAppCode: result.exceptionAppCode,
                    codeRaw: result.codeRaw,
                    hidden: result.hidden,
                    state: result.state
                }
            ];

            sendToInsights(
                insightsEvent,
                function (err) {
                    if (err) {
                        console.log(`error sending to insights: ${err}`);
                    }
                });

            getStacktrace(result.errorGroupId);
        });
    });
}).end();

var getStacktrace = function (errorGroupId) {
    console.log('errorGroupId: ' + errorGroupId)
    var options = {
        host: 'api.appcenter.ms',
        port: 443,
        path: '/v0.1/apps/' + msAppCenterOwnerName + '/' + msAppCenterAppName + '/errors/errorGroups/' + errorGroupId + '/stacktrace',
        method: 'GET',
        headers: {
            'X-API-Token': msAppCenterAPIToken,
            'Accept': 'application/json'
        }
    };

    https.request(options, function (res) {
        console.log('STATUS Stacktrace: ' + res.statusCode);
        //console.log('HEADERS: ' + JSON.stringify(res.headers));
        var body = '';
        res.on('data', function (chunk) {
            body += chunk;
        });
        res.on('end', function () {
            //console.log('BODY: ' + body);
            var json = JSON.parse(body);
            //console.log('json: ' + JSON.stringify(json));

            var insightsEvent = [
                {
                    eventType: 'MicrosoftAppCenterErrorGroupsStacktrace',
                    errorGroupId: errorGroupId,
                    title: json.title,
                    reason: json.reason
                }
            ];

            sendToInsights(
                insightsEvent,
                function (err) {
                    if (err) {
                        console.log(`error sending to insights: ${err}`);
                    }
                }
            );

            var seq = 0;
            var insightsEvent = [];
            json.exception.frames.forEach(frames => {
                var frame =
                {
                    eventType: 'MicrosoftAppCenterErrorGroupsStacktraceExceptions',
                    errorGroupId: errorGroupId,
                    exceptionReason: json.exception.reason,
                    exceptionType: json.exception.type,
                    exceptionRelevant: json.exception.relevant,
                    exceptionPlatform: json.exception.platform,
                    sequence: seq,
                    className: frames.class_name,
                    method: frames.method,
                    app_code: frames.app_code,
                    framework_name: frames.framework_name,
                    code_raw: frames.code_raw,
                    code_formatted: frames.code_formatted,
                    language: frames.language,
                    relevant: frames.relevant,
                    method_params: frames.method_params
                };

                insightsEvent.push(frame);

                seq++;
            });

            sendToInsights(
                insightsEvent,
                function (err) {
                    if (err) {
                        console.log(`error sending to insights: ${err}`);
                    }
                }
            );
        });
    }).end();
}
    
    const response = {
        statusCode: 200,
        body: JSON.stringify('Hello from Lambda!'),
    };
    return response;
};
