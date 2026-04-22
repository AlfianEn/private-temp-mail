const http = require('http');

exports.hook_data_post = function (next, connection) {
  try {
    const txn = connection?.transaction;
    if (!txn) return next();

    const to = Array.isArray(txn.rcpt_to) && txn.rcpt_to[0] ? txn.rcpt_to[0].address() : '';
    const from = txn.mail_from ? txn.mail_from.address() : '';
    const subjectHeader = txn.header.get('Subject');
    const subject = Array.isArray(subjectHeader) ? subjectHeader[0] : subjectHeader || '';
    const text = txn.body?.bodytext || '';
    const html = txn.body?.children?.map((child) => child?.bodytext || '').filter(Boolean).join('\n\n') || '';

    const payload = JSON.stringify({
      to,
      from,
      subject,
      text,
      html,
      headers: txn.header?.headers_decoded || {},
    });

    const req = http.request(
      {
        hostname: '127.0.0.1',
        port: 3001,
        path: '/api/inbound',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(payload),
        },
      },
      (res) => {
        let data = '';
        res.on('data', (chunk) => {
          data += chunk;
        });
        res.on('end', () => {
          if (res.statusCode && res.statusCode >= 200 && res.statusCode < 300) {
            return next(OK);
          }

          connection.logerror(this, `forward failed: ${res.statusCode} ${data}`);
          return next(DENYSOFT, 'temporary inbound processing failure');
        });
      },
    );

    req.on('error', (error) => {
      connection.logerror(this, `forward error: ${error.message}`);
      return next(DENYSOFT, 'temporary inbound processing failure');
    });

    req.write(payload);
    req.end();
  } catch (error) {
    connection.logerror(this, `hook_data_post exception: ${error.message}`);
    return next(DENYSOFT, 'temporary inbound processing failure');
  }
};
