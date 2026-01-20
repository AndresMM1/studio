const https = require('node:https');

async function proxyAsk(context, req) {
    const backendHost = process.env.BACKEND_HOST || 'alvaro-extrapolative-pseudoimpartially.ngrok-free.dev';
    const backendPath = process.env.BACKEND_PATH || '/ask';
    const timeoutMs = Number.parseInt(process.env.BACKEND_TIMEOUT_MS || '10000', 10);

    const safeBody = (req && typeof req.body === 'object' && req.body !== null) ? req.body : {};
    const data = JSON.stringify(safeBody);
    const contentLength = Buffer.byteLength(data, 'utf8');
    if (contentLength > 1_000_000) {
        context.res = {
            status: 413,
            body: 'Payload too large.'
        };
        return;
    }

    const options = {
        hostname: backendHost,
        path: backendPath,
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Content-Length': contentLength
        },
        timeout: timeoutMs
    };

    return new Promise((resolve) => {
        const proxyReq = https.request(options, (res) => {
            let body = '';
            res.setEncoding('utf8');
            res.on('data', (chunk) => { body += chunk; });
            res.on('end', () => {
                context.res = {
                    status: res.statusCode,
                    body,
                    headers: {
                        'Content-Type': 'application/json'
                    }
                };
                resolve();
            });
        });

        proxyReq.on('timeout', () => {
            proxyReq.destroy(new Error('Upstream request timed out'));
        });

        proxyReq.on('error', (err) => {
            context.res = {
                status: 502,
                body: 'Error connecting to backend: ' + err.message
            };
            resolve();
        });

        proxyReq.write(data);
        proxyReq.end();
    });
}

module.exports = proxyAsk;
