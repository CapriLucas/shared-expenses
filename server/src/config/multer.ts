import multer from "multer";
import { Request } from "express";

const fileFilter = (
  _req: Request,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback
) => {
  const allowedMimes = ["image/jpeg", "image/png", "application/pdf"];
  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(
      new Error("Invalid file type. Only JPEG, PNG and PDF files are allowed.")
    );
  }
};

export const upload = multer({
  storage: multer.memoryStorage(),
  fileFilter,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE!) || 5 * 1024 * 1024, // Default 5MB
  },
});
