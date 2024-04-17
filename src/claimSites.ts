import "dotenv/config";
import jwt from "jsonwebtoken";

const { NETLIFY_OAUTH_APP_CLIENT_ID, NETLIFY_OAUTH_APP_SECRET } = process.env;

function sign(userSessionID: string): string {
  return jwt.sign(
    { client_id: NETLIFY_OAUTH_APP_CLIENT_ID, session_id: userSessionID },
    NETLIFY_OAUTH_APP_SECRET,
    {
      expiresIn: "5m",
    },
  );
}

async function claimSites() {
  const userSessionID = process.argv[2];
  if (!userSessionID) {
    console.error(`Usage: npm run claim <user_session_id>`);
    return;
  }

  const token = sign(userSessionID);
  const claimURL = `https://app.netlify.com/claim#${token}`;

  console.log("Log in to Netlify, then go here to claim your sites!");
  console.log(claimURL);
}

claimSites();
