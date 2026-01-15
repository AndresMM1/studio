const https = require('https');

module.exports = async function (context, req) {
    const data = JSON.stringify(req.body);

    const options = {
        hostname: 'alvaro-extrapolative-pseudoimpartially.ngrok-free.dev',
        path: '/ask',
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Content-Length': data.length
        }
    };

    return new Promise((resolve) => {
        const proxyReq = https.request(options, (res) => {
            let body = '';
            res.on('data', (chunk) => body += chunk);
            res.on('end', () => {
                context.res = {
                    status: res.statusCode,
                    body: body,
                    headers: {
                        'Content-Type': 'application/json'
                    }
                };
                resolve();
            });
        });

        proxyReq.on('error', (e) => {
            context.res = {
                status: 500,
                body: "Error connecting to backend: " + e.message
            };
            resolve();
        });

        proxyReq.write(data);
        proxyReq.end();
    });
};
