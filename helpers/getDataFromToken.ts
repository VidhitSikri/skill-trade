import { NextRequest } from "next/server";
import jwt from "jsonwebtoken";
import { DecodedToken } from "@/types/decodedToken";

export const getDataFromToken = (req: NextRequest): string | null => {
  const token = req.cookies.get("token")?.value;
  if (!token) {
    return null;
  }

  try {
    const secret = process.env.TOKEN_SECRET ?? process.env.JWT_SECRET!;
    const decodedData = jwt.verify(token, secret) as DecodedToken;
    return decodedData.id;
  } catch (error) {
    console.error("Invalid token:", error);
    return null;
  }
};