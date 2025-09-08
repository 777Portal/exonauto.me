const fs = require('fs');
const path = require('path');

const serviceFilePath = '/etc/systemd/system/exonauto.service';

const workingDir = path.dirname(__dirname);
const execStartPath = path.join(workingDir, 'server.js');

const exec = require('child_process').exec;

// first build    
exec('npm run build', (restartErr) => {
  if (restartErr) {
      console.error('Error building! \n ', restartErr);
    } else {
      console.log('Built w/ vite..');
    }
});

// ... then restart / create service.
// exonauto is hardcoded, should fix that asp
const serviceContent = `
[Unit]
Description=Exonauto.me

[Service]
ExecStart=/usr/bin/node ${execStartPath}
Restart=always
User=exon
Group=exon
Environment=PATH=/usr/bin:/usr/local/bin
Environment=NODE_ENV=production
WorkingDirectory=${workingDir}

[Install]
WantedBy=multi-user.target
`;

fs.readFile(serviceFilePath, 'utf8', (err, existingContent) => {
  if (err || existingContent !== serviceContent) {
    fs.writeFile(serviceFilePath, serviceContent, (writeErr) => {
      if (writeErr) {
        console.error('Error writing service file:', writeErr);
      } else {
        console.log('Service file updated or created successfully.');

        const exec = require('child_process').exec;
        exec('systemctl daemon-reload', (reloadErr, stdout, stderr) => {
          if (reloadErr) {
            console.error('Error reloading systemd:', reloadErr);
          } else {
            console.log('Systemd daemon reloaded.');

            exec('systemctl enable exonauto.service && systemctl start exonauto.service', (startErr) => {
              if (startErr) {
                console.error('Error starting service:', startErr);
              } else {
                console.log('Service started successfully.');
              }
            });
          }
        });
      }
    });
  } else {
    console.log('Service file already up to date. Restarting');
    
    exec('systemctl restart exonauto.service', (restartErr) => {
        if (restartErr) {
            console.error('Error starting service:', restartErr);
          } else {
            console.log('Service started successfully.');
          }
        });
    }
});