//handle duplicates
const handleDuplicateKeyError = (err, res) => {
  const field = Object.keys(err.keyValue);
  const code = 409;
  const error = `An document with that ${field} already exists.`;
  console.log('congrats you hit the duped keys error');
  res.status(code).send({ messages: error, fields: field });
};

//handle validation errors
const handleValidationError = (err, res) => {
  console.log('congrats you hit the validation middleware');
  let errors = Object.values(err.errors).map((el) => el.message);
  let fields = Object.values(err.errors).map((el) => el.path);
  let code = 400;
  if (errors.length > 1) {
    const formattedErrors = errors.join(' ');
    res.status(code).send({ messages: formattedErrors, fields: fields });
  } else {
    res.status(code).send({ messages: errors, fields: fields });
  }
};

//handle token refreshes
const handleUnauthorizedError = async (err, req, res, next) => {
  console.log('congrats you hit the unauthorized error middleware');
  const code = 401;
  const error = 'Unauthorized: You do not have permission to access this resource.';
  res.status(code).send({ messages: error });

  // Call the refreshController middleware to attempt token refresh
  await refreshController(req, res, next);
};

// eslint-disable-next-line no-unused-vars
module.exports = (err, req, res, next) => {
  try {
    console.log('congrats you hit the error middleware');
    if (err.name === 'ValidationError') {
      return (err = handleValidationError(err, res));
    }
    if (err.code && err.code == 11000) {
      return (err = handleDuplicateKeyError(err, res));
    }
    if (err.status === 401) {
      return (err = handleUnauthorizedError(err, req, res, next));
    }
  } catch (err) {
    res.status(500).send('An unknown error occurred.');
  }
};
