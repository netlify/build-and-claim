# Creating claimable sites

This repo shows how to create a claimable site from a template. Unlike [Netlify Drop](https://app.netlify.com/drop), which can only upload pre-built distribution assets, this flow allows for sites to be built in an owner's CI/CD pipeline and owned in the owner's account. Later, new users can "claim" these sites as their own, by securely transferring them into their own account.

## Setup

### Create a GitHub personal access token

Create a [classic GitHub personal access token](https://github.com/settings/tokens/new). Set no expiration, unless you want to be responsible for eventual rotation. The token must have the `repo` and `admin:repo_hook` scopes set.

- The token's value corresponds to the `GITHUB_ADMIN_TOKEN` env var.

### Create a Netlify OAuth Application and PAT

Go to the [Netlify UI](https://app.netlify.com) and log into the user account that you intend to be the initial owner of all new sites.

First, [create a new OAuth App](https://app.netlify.com/user/applications#oauth).

- The `Client ID` value corresponds to the `NETLIFY_OAUTH_APP_CLIENT_ID` env var.
- The `Secret` value corresponds to the `NETLIFY_OAUTH_APP_SECRET` env var.

Then, [create a new personal access token](https://app.netlify.com/user/applications#personal-access-tokens). It's important for the PAT to be created by the same user who created the OAuth App. Be sure to select the SAML checkbox if you log in with SSO. Also, do not set an expiry, unless you want to be responsible for eventually rotating the PAT.

- The token's value corresponds to the `NETLIFY_ADMIN_PAT` env var.

### Define local environment variables

Rename `.env.example` to `.env`, filling in your values as specified above.

### Modify parameters passed to site creation function

Tweak the parameters of the main `createClaimableSiteFromTemplate()` function in `src/createSite.ts` as you see fit.

## Running

There are two scripts in this repo that are used for illustrative purposes. You can run them locally to try them out / verify them, but for production usage, you should copy them into your own web applications, adjusting to your codebases' conventions where needed.

`npm run create <session_id>` will perform the following steps. The user does not need to have a GitHub account or a Netlify account to do these steps. Instead, admin credentials from an owner's GitHub and Netlify accounts will be used.

- Create a new template from an input source repo
- Create a new destination repo
- Create a new deploy key
- Add the deploy key to the destination repo
- Add webhooks to the destination repo
- Create a site that is linked to the destination repo

The source repo, aka template, can be any public GitHub repo. The destination repo will be created on the GitHub admin's account (to be later transferred to a GitHub user's account). The new site will be created on the Netlify admin's account (to be later transferred to the user's Netlify account).

`npm run claim <session_id>` will claim all the sites that the user has created from the `npm run create` script.
