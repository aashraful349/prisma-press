import { NextFunction, Request, Response } from "express";
import httpStatus from "http-status";
import { Prisma } from "../../generated/prisma/client";
import { prisma } from "../lib/prisma";
import { stat } from "node:fs";

export const globalErrorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  console.log("Error", err);

  let statusCode;
  let errorMessage = err.message || "Internal Server Error";
  let errName = err.name || "Internal Server Error";
  if (err instanceof Prisma.PrismaClientValidationError) {
    statusCode = httpStatus.BAD_REQUEST;
    errorMessage = "you have provided incorrect field or missing field";
  } else if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === "P2002") {
      statusCode = httpStatus.BAD_REQUEST;
      errorMessage = "Duplicate field value entered";
    }
    else if(err.code==="P2003"){
        statusCode = httpStatus.BAD_REQUEST;
        errorMessage = "Foreign key constraint failed";

    }
    else if(err.code==="P2025"){
        statusCode = httpStatus.BAD_REQUEST;
        errorMessage = "Record not found";
    }
  }
  else if(err instanceof Prisma.PrismaClientInitializationError){
    if(err.errorCode==="P1000"){
        statusCode = httpStatus.UNAUTHORIZED;
        errorMessage = "Authorization failed";
    }
    else if(err.errorCode==="P1001"){
        statusCode = httpStatus.BAD_REQUEST;
        errorMessage = "Database server is not available";
    }
  }
  else if(err instanceof Prisma.PrismaClientUnknownRequestError){
    statusCode = httpStatus.INTERNAL_SERVER_ERROR;
    errorMessage = "An unknown error occurred";
  }

  res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
    success: false,
    statusCode: statusCode || httpStatus.INTERNAL_SERVER_ERROR,
    message: errorMessage,
    // errorCode: err.code || null,
    name: errName,
    error: err.stack,
  });
};
