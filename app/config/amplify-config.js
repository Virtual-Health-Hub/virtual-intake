"use client";

import { Amplify } from "aws-amplify";
import amplifyConfig from "../public/amplify_outputs.json"; // ✅ update path based on your file structure

export async function configureAmplify() {
  Amplify.configure(amplifyConfig);
}
