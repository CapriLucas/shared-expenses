export const mockDeleteFile = jest.fn().mockResolvedValue(undefined);

// Mock the entire module
jest.mock("../../services/storage", () => ({
  uploadFile: (file: Express.Multer.File) => {
    return Promise.resolve(
      `https://storage.googleapis.com/test-bucket/${file.originalname}`
    );
  },
  deleteFile: mockDeleteFile,
}));

// Mock the Google Cloud Storage client
jest.mock("@google-cloud/storage", () => {
  return {
    Storage: jest.fn().mockImplementation(() => ({
      bucket: jest.fn().mockReturnValue({
        file: jest.fn().mockReturnValue({
          createWriteStream: jest.fn(),
          makePublic: jest.fn(),
          delete: jest.fn(),
        }),
      }),
    })),
  };
});
