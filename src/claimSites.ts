import "dotenv/config";
import jwt from "jsonwebtoken";

import { post } from "./utils";

const {
  NETLIFY_OAUTH_APP_CLIENT_ID,
  NETLIFY_OAUTH_APP_SECRET,
  NETLIFY_USER_PAT,
} = process.env;

function sign(sessionID: string): string {
  return jwt.sign(
    { client_id: NETLIFY_OAUTH_APP_CLIENT_ID, session_id: sessionID },
    NETLIFY_OAUTH_APP_SECRET,
    {
      expiresIn: "1m",
    },
  );
}

async function claimSites(sessionID: string) {
  const response = await post(`https://api.netlify.com/api/v1/sites/claim`, {
    headers: {
      Authorization: `Bearer ${NETLIFY_USER_PAT}`,
    },
    body: {
      token: sign(sessionID),
    },
  });

  console.log("All sites successfully claimed!");
  console.log(response);
}

claimSites("unique-user-identifier");
