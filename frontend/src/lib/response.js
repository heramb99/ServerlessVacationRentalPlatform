const handleSuccess = (data = {}, status = 200, headers = {}) => {
  return new Response(JSON.stringify(data), {
    status: status,
    headers: {
      'Content-Type': 'application/json',
      ...headers,
    },
  });
};

const handleError = (error = {}, status = 500, headers = {}) => {
  return new Response(JSON.stringify(error), {
    status: status,
    headers: {
      'Content-Type': 'application/json',
      ...headers,
    },
  });
};

export { handleError, handleSuccess };
