module.exports = (app, httpUserResponseListener) => {
    app.post('/respond', (req, res) => {
      const { userId, answer } = req.body;
      httpUserResponseListener.registerResponse(userId, answer);
      res.status(200).send({ status: 'received' });
    });
  };
  