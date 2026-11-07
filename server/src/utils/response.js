export const success = (res, data, statusCode = 200) => {
  return res.status(statusCode).json({ status: 'success', data });
};

export const created = (res, data) => {
  return success(res, data, 201);
};

export const noContent = (res) => {
  return res.status(204).end();
};

export const paginated = (res, data, pagination) => {
  return res.status(200).json({ status: 'success', data, pagination });
};
