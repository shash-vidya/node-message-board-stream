const http = require('http');
const fs = require('fs');
const path = require('path');

// Ensure the message file exists
const filePath = path.join(__dirname, 'message.txt');

const server = http.createServer((req, res) => {
  if (req.url === '/' && req.method === 'GET') {
    // Show all previous messages (newest at top)
    fs.readFile(filePath, 'utf8', (err, data) => {
      res.setHeader('Content-Type', 'text/html');
      res.write('<html><head><title>Message Board</title></head><body>');
      res.write('<h2>All Messages</h2>');
      res.write(`<pre>${data || 'No messages yet.'}</pre>`);
      res.write('<form action="/message" method="POST">');
      res.write('<input type="text" name="message" placeholder="Type message..." required>');
      res.write('<button type="submit">Send</button>');
      res.write('</form>');
      res.write('</body></html>');
      res.end();
    });

  } else if (req.url === '/message' && req.method === 'POST') {
    const body = [];

    req.on('data', (chunk) => {
      body.push(chunk);
    });

    req.on('end', () => {
      const parsedBody = Buffer.concat(body).toString();
      const message = decodeURIComponent(parsedBody.split('=')[1].replace(/\+/g, ' '));

      // Prepend the message to the file
      fs.readFile(filePath, 'utf8', (err, oldData) => {
        const updatedData = `${message}\n${oldData || ''}`;
        fs.writeFile(filePath, updatedData, (err) => {
          if (err) {
            res.statusCode = 500;
            res.end('Error writing message.');
          } else {
            res.statusCode = 302;
            res.setHeader('Location', '/');
            res.end();
          }
        });
      });
    });

  } else {
    // Handle 404
    res.statusCode = 404;
    res.setHeader('Content-Type', 'text/plain');
    res.end('404 Not Found');
  }
});

server.listen(3004, () => {
  console.log('✅ Task 2 Server running at http://localhost:3004');
});
