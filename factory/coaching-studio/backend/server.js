const http = require('http');
const { execFile } = require('child_process');
const { URL } = require('url');

const PORT = Number(process.env.PORT) || 3000;

const server = http.createServer((req, res) => {
  const requestUrl = new URL(
    req.url || '/',
    `http://${req.headers.host || 'localhost'}`
  );

  if (
    req.method === 'GET' &&
    requestUrl.pathname === '/api/premium-live/stream'
  ) {
    const youtubeUrl = (
      requestUrl.searchParams.get('url') || ''
    ).trim();

    if (!youtubeUrl) {
      res.writeHead(400, {
        'Content-Type': 'application/json',
      });

      return res.end(
        JSON.stringify({
          success: false,
          message: 'YouTube URL is required',
        })
      );
    }

    execFile(
      'yt-dlp',
      [
        '--no-playlist',
        '--extractor-args',
        'youtube:player_client=tv,web_safari',
        '-f',
        'bestvideo[protocol*=m3u8]/best[protocol*=m3u8]',
        '-g',
        youtubeUrl,
      ],
      {
        timeout: 15000,
        maxBuffer: 1024 * 1024,
      },
      (error, stdout, stderr) => {
        if (error || !stdout.trim()) {
          console.error(
            'Premium Live extraction failed:',
            stderr || error
          );

          res.writeHead(500, {
            'Content-Type': 'application/json',
          });

          return res.end(
            JSON.stringify({
              success: false,
              message: 'Unable to extract live stream',
            })
          );
        }

        res.writeHead(200, {
          'Content-Type': 'application/json',
        });

        return res.end(
          JSON.stringify({
            success: true,
            streamUrl: stdout.trim(),
          })
        );
      }
    );

    return;
  }

  res.writeHead(404, {
    'Content-Type': 'application/json',
  });

  res.end(
    JSON.stringify({
      success: false,
      message: 'Not found',
    })
  );
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(
    `Premium Live backend running on port ${PORT}`
  );
});
