import type { RequestHandler } from "express";

const notFound: RequestHandler = (req, res, next) => {
  console.log("404 REQUEST:", {
    method: req.method,
    url: req.originalUrl,
    path: req.path,
  });

  res.status(404);
  const error = new Error(`Not Found - ${req.originalUrl}`);
  next(error);
};

export default notFound;
