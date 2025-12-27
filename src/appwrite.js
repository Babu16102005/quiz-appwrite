import { Client, Account, Databases, Avatars } from "appwrite";

const client = new Client();

client
  .setEndpoint("https://nyc.cloud.appwrite.io/v1")
  .setProject("694f71810028985913f0");

export const account = new Account(client);
export const databases = new Databases(client);
export const avatars = new Avatars(client);

export const DATABASE_ID = "quiz_db";
export const QUESTIONS_COLLECTION_ID = "questions";
export const SCORES_COLLECTION_ID = "scores";

export { client };
