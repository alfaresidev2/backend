import { Request, Response } from "express";
import { generateUploadUrl } from "../../../utils/awsService";

export const getFileUploadSignedUrl = async (req: Request, res: Response) => {
  try {
    const fileName = req?.query?.fileName;
    const fileType = req?.query?.fileType;

    const { url, key } = await generateUploadUrl({ fileName: fileName as string, fileType: fileType as string });

    res.send({ url, key });
  } catch (error) {
    res.status(500).json({ message: "Error creating upload url" });
  }
};
