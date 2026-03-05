const { exec } = require('child_process');
exec('../node_modules/.bin/vite', (error, stdout, stderr) => {
  console.log('stdout:', stdout);
  console.log('stderr:', stderr);
  if (error) console.log('error:', error);
});
