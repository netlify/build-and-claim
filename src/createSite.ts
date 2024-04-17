import "dotenv/config";

import { getEnv, post } from "./utils";

interface Props {
  github: {
    source: {
      repoURL: string;
      defaultBranch: string;
    };
    destination: {
      repoName: string;
      repoPrivate: boolean;
      defaultBranch: string;
    };
  };
  netlify: {
    team: {
      slug: string;
    };
    site: {
      name: string;
      publishDir: string;
      buildCommand: string;
      env?: Record<string, string>;
    };
  };
}

const { GITHUB_ADMIN_TOKEN, NETLIFY_ADMIN_PAT } = process.env;

export const githubHeaders = {
  Accept: "application/vnd.github+json",
  Authorization: `Bearer ${GITHUB_ADMIN_TOKEN}`,
  "X-GitHub-Api-Version": "2022-11-28",
};

export const netlifyHeaders = {
  Authorization: `Bearer ${NETLIFY_ADMIN_PAT}`,
  "Content-Type": "application/json",
};

async function createClaimableSiteFromTemplate({ github, netlify }: Props) {
  const userSessionID = process.argv[2];
  if (!userSessionID) {
    console.error(`Usage: npm run create <user_session_id>`);
    return;
  }

  console.log("Creating new template from source repo...");
  const template = await post("https://api.netlify.com/api/v1/templates", {
    headers: netlifyHeaders,
    body: {
      path: new URL(github.source.repoURL).pathname.replace(/^\//, ""),
      slug: new URL(github.source.repoURL).pathname.replaceAll("/", "-"),
      authorized_url: github.source.repoURL,
      branch: github.source.defaultBranch,
    },
  });

  console.log("Creating new destination repo...");
  const newRepo = await post("https://api.github.com/user/repos", {
    headers: githubHeaders,
    body: {
      name: github.destination.repoName,
      private: github.destination.repoPrivate,
    },
  });

  console.log("Creating new deploy key...");
  const deployKey = await post("https://api.netlify.com/api/v1/deploy_keys", {
    headers: netlifyHeaders,
  });

  console.log("Adding deploy key to destination repo...");
  await post(`https://api.github.com/repos/${newRepo.full_name}/keys`, {
    headers: githubHeaders,
    body: {
      title: "Deploy to Netlify",
      read_only: false,
      key: deployKey.public_key,
    },
  });

  console.log("Adding webhooks to destination repo...");
  await post(`https://api.github.com/repos/${newRepo.full_name}/hooks`, {
    headers: githubHeaders,
    body: {
      name: "web",
      active: true,
      events: [
        "delete",
        "push",
        "pull_request",
        "create",
        "issue_comment",
        "pull_request_review",
        "pull_request_review_comment",
      ],
      config: {
        url: "https://api.netlify.com/hooks/github",
        content_type: "json",
      },
    },
  });

  console.log("Creating claimable site from template...");
  const site = await post("https://api.netlify.com/api/v1/sites", {
    headers: netlifyHeaders,
    body: {
      account_slug: netlify.team.slug,
      name: netlify.site.name,
      template_id: template.id,
      session_id: userSessionID,
      created_via: "ai",
      repo: {
        provider: "github",
        branch: newRepo.default_branch,
        id: newRepo.id,
        repo: newRepo.full_name,
        private: newRepo.private,
        deploy_key_id: deployKey.id,
        dir: netlify.site.publishDir,
        cmd: netlify.site.buildCommand,
      },
      default_hooks_data: {
        access_token: GITHUB_ADMIN_TOKEN,
      },
      env: getEnv(netlify.site.env),
    },
  });

  console.log("");
  console.log("Site created successfully!");
  console.log("Site ID:  ", site.id);
  console.log("Admin URL:", site.admin_url);
  console.log("Repo URL: ", site.build_settings.repo_url);
}

createClaimableSiteFromTemplate({
  github: {
    source: {
      repoURL: "https://github.com/jasonbarry/face64",
      defaultBranch: "main",
    },
    destination: {
      repoName: "my-cool-new-repo-from-ai",
      repoPrivate: true,
      defaultBranch: "main",
    },
  },
  netlify: {
    team: {
      slug: "jason-barry",
    },
    site: {
      name: "my-globally-unique-site-name",
      publishDir: "site/",
      buildCommand: "echo 'hi'",
      env: {
        MY_API_KEY: "my-api-key-value",
      },
    },
  },
});
