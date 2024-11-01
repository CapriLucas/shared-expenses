import { Storage } from "@google-cloud/storage";
import { format } from "util";

const storage = new Storage({
  projectId: process.env.GOOGLE_CLOUD_PROJECT_ID,
  credentials: {
    client_email: process.env.GOOGLE_CLOUD_CLIENT_EMAIL,
    private_key: process.env.GOOGLE_CLOUD_PRIVATE_KEY?.replace(/\\n/g, "\n"),
  },
});

const bucket = storage.bucket(process.env.GOOGLE_CLOUD_BUCKET_NAME!);

export const uploadFile = async (
  file: Express.Multer.File
): Promise<string> => {
  try {
    const blob = bucket.file(`receipts/${Date.now()}-${file.originalname}`);
    const blobStream = blob.createWriteStream({
      resumable: false,
      metadata: {
        contentType: file.mimetype,
      },
    });

    return new Promise((resolve, reject) => {
      blobStream.on("error", (error) => {
        reject(error);
      });

      blobStream.on("finish", async () => {
        // Since uniform bucket-level access is enabled, we don't need to make individual files public
        // Instead, we'll use a signed URL or the public URL if the bucket is public
        const publicUrl = format(
          `https://storage.googleapis.com/${bucket.name}/${blob.name}`
        );

        resolve(publicUrl);
      });

      blobStream.end(file.buffer);
    });
  } catch (error) {
    console.error("Upload error:", error);
    throw new Error("Failed to upload file");
  }
};

export const deleteFile = async (fileUrl: string): Promise<void> => {
  try {
    const fileName = fileUrl.split("/").pop();
    if (!fileName) throw new Error("Invalid file URL");

    const file = bucket.file(`receipts/${fileName}`);
    await file.delete();
  } catch (error) {
    console.error("Delete error:", error);
    throw new Error("Failed to delete file");
  }
};
