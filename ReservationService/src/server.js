const app = require('./app');
const { startListening } = require('./infrastructure/eventReceiver');

const port = 3000;

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
  startListening();
});
