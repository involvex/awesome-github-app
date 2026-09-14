export const repoFixture = {
  id: 1,
  name: "awesome-github-app",
  full_name: "octocat/awesome-github-app",
  owner: {
    login: "octocat",
    avatar_url: "https://avatars.githubusercontent.com/u/1",
  },
  private: false,
  description: "A modern GitHub client.",
  stargazers_count: 5,
  forks_count: 1,
  open_issues_count: 0,
  html_url: "https://github.com/octocat/awesome-github-app",
  clone_url: "https://github.com/octocat/awesome-github-app.git",
  watchers_count: 3,
  default_branch: "main",
};

export const topicsFixture = ["expo", "react-native", "github-client"];

export const activityFixture = [
  {
    id: "1",
    type: "PushEvent",
    actor: {
      login: "octocat",
      avatar_url: "https://avatars.githubusercontent.com/u/1",
    },
    repo: {
      name: "octocat/awesome-github-app",
      url: "https://api.github.com/repos/octocat/awesome-github-app",
    },
    payload: { commits: [{ sha: "abc123", message: "Initial commit" }] },
    public: true,
    created_at: "2024-01-15T10:30:00Z",
  },
  {
    id: "2",
    type: "IssuesEvent",
    actor: {
      login: "octocat",
      avatar_url: "https://avatars.githubusercontent.com/u/1",
    },
    repo: {
      name: "octocat/awesome-github-app",
      url: "https://api.github.com/repos/octocat/awesome-github-app",
    },
    payload: { action: "opened", issue: { number: 1, title: "First issue" } },
    public: true,
    created_at: "2024-01-14T15:45:00Z",
  },
];

export const notificationsFixture = [
  {
    id: "123456789",
    unread: true,
    reason: "participating",
    updated_at: "2024-01-15T10:30:00Z",
    last_read_at: "2024-01-14T10:00:00Z",
    subject: {
      title: "Fix bug in login flow",
      url: "https://api.github.com/repos/octocat/awesome-github-app/issues/42",
      latest_comment_url:
        "https://api.github.com/repos/octocat/awesome-github-app/issues/comments/123",
      type: "Issue",
    },
    repository: {
      id: 1,
      name: "awesome-github-app",
      full_name: "octocat/awesome-github-app",
      owner: { login: "octocat" },
      private: false,
      html_url: "https://github.com/octocat/awesome-github-app",
    },
  },
  {
    id: "123456790",
    unread: false,
    reason: "mention",
    updated_at: "2024-01-14T15:45:00Z",
    last_read_at: "2024-01-14T16:00:00Z",
    subject: {
      title: "Add new feature",
      url: "https://api.github.com/repos/octocat/awesome-github-app/pulls/15",
      latest_comment_url:
        "https://api.github.com/repos/octocat/awesome-github-app/pulls/comments/456",
      type: "PullRequest",
    },
    repository: {
      id: 1,
      name: "awesome-github-app",
      full_name: "octocat/awesome-github-app",
      owner: { login: "octocat" },
      private: false,
      html_url: "https://github.com/octocat/awesome-github-app",
    },
  },
];

export const trendingRepoFixture = [
  {
    id: 100,
    name: "trending-repo",
    full_name: "owner/trending-repo",
    owner: {
      login: "owner",
      avatar_url: "https://avatars.githubusercontent.com/u/100",
    },
    description: "A trending repository",
    stargazers_count: 500,
    forks_count: 50,
    language: "TypeScript",
    html_url: "https://github.com/owner/trending-repo",
  },
  {
    id: 101,
    name: "another-trending",
    full_name: "owner2/another-trending",
    owner: {
      login: "owner2",
      avatar_url: "https://avatars.githubusercontent.com/u/101",
    },
    description: "Another trending repo",
    stargazers_count: 300,
    forks_count: 30,
    language: "Python",
    html_url: "https://github.com/owner2/another-trending",
  },
];

export const myReposFixture = [
  {
    id: 10,
    name: "my-repo-1",
    full_name: "octocat/my-repo-1",
    owner: {
      login: "octocat",
      avatar_url: "https://avatars.githubusercontent.com/u/1",
    },
    private: false,
    description: "My first repo",
    stargazers_count: 10,
    forks_count: 2,
    language: "JavaScript",
    fork: false,
    updated_at: "2024-01-15T10:00:00Z",
    html_url: "https://github.com/octocat/my-repo-1",
  },
  {
    id: 11,
    name: "my-repo-2",
    full_name: "octocat/my-repo-2",
    owner: {
      login: "octocat",
      avatar_url: "https://avatars.githubusercontent.com/u/1",
    },
    private: true,
    description: "My private repo",
    stargazers_count: 0,
    forks_count: 0,
    language: "TypeScript",
    fork: true,
    updated_at: "2024-01-14T10:00:00Z",
    html_url: "https://github.com/octocat/my-repo-2",
  },
];

export const starredReposFixture = [
  {
    id: 20,
    name: "starred-repo",
    full_name: "other/starred-repo",
    description: "A starred repo",
    stargazers_count: 100,
    forks_count: 10,
    language: "Go",
    owner: {
      login: "other",
      avatar_url: "https://avatars.githubusercontent.com/u/20",
    },
  },
  {
    id: 21,
    name: "another-starred",
    full_name: "other2/another-starred",
    description: "Another starred repo",
    stargazers_count: 50,
    forks_count: 5,
    language: "Rust",
    owner: {
      login: "other2",
      avatar_url: "https://avatars.githubusercontent.com/u/21",
    },
  },
];

export const searchReposFixture = [
  {
    id: 30,
    name: "search-result-1",
    full_name: "search/search-result-1",
    owner: {
      login: "search",
      avatar_url: "https://avatars.githubusercontent.com/u/30",
    },
    description: "Search result repo",
    stargazers_count: 200,
    forks_count: 20,
    language: "JavaScript",
    html_url: "https://github.com/search/search-result-1",
  },
];

export const searchUsersFixture = [
  {
    id: 30,
    login: "searchuser",
    avatar_url: "https://avatars.githubusercontent.com/u/30",
    html_url: "https://github.com/searchuser",
    type: "User",
  },
];

export const searchTopicsFixture = [
  {
    id: 31,
    name: "search-topic",
    full_name: "topic/search-topic",
    owner: {
      login: "topic",
      avatar_url: "https://avatars.githubusercontent.com/u/31",
    },
    description: "Topic repo",
    stargazers_count: 80,
    forks_count: 8,
    language: "Python",
    html_url: "https://github.com/topic/search-topic",
  },
];

export const contributionsFixture = [
  {
    contributionDays: [
      { date: "2024-01-01", contributionCount: 5, color: "#c6e48b" },
      { date: "2024-01-02", contributionCount: 3, color: "#7bc96f" },
      { date: "2024-01-03", contributionCount: 0, color: "#ebedf0" },
      { date: "2024-01-04", contributionCount: 8, color: "#239a3b" },
      { date: "2024-01-05", contributionCount: 2, color: "#c6e48b" },
      { date: "2024-01-06", contributionCount: 0, color: "#ebedf0" },
      { date: "2024-01-07", contributionCount: 1, color: "#c6e48b" },
    ],
  },
  {
    contributionDays: [
      { date: "2024-01-08", contributionCount: 4, color: "#7bc96f" },
      { date: "2024-01-09", contributionCount: 0, color: "#ebedf0" },
      { date: "2024-01-10", contributionCount: 6, color: "#239a3b" },
      { date: "2024-01-11", contributionCount: 3, color: "#7bc96f" },
      { date: "2024-01-12", contributionCount: 0, color: "#ebedf0" },
      { date: "2024-01-13", contributionCount: 7, color: "#239a3b" },
      { date: "2024-01-14", contributionCount: 0, color: "#ebedf0" },
    ],
  },
];

export const pinnedReposFixture = {
  totalCount: 2,
  repos: [
    {
      __typename: "Repository",
      id: "R_1",
      name: "pinned-repo-1",
      nameWithOwner: "octocat/pinned-repo-1",
      description: "A pinned repository",
      stargazerCount: 25,
      forkCount: 3,
      primaryLanguage: { name: "TypeScript" },
      owner: {
        login: "octocat",
        avatarUrl: "https://avatars.githubusercontent.com/u/1",
      },
    },
    {
      __typename: "Repository",
      id: "R_2",
      name: "pinned-repo-2",
      nameWithOwner: "octocat/pinned-repo-2",
      description: "Another pinned repo",
      stargazerCount: 15,
      forkCount: 1,
      primaryLanguage: { name: "Python" },
      owner: {
        login: "octocat",
        avatarUrl: "https://avatars.githubusercontent.com/u/1",
      },
    },
  ],
};

export const repoReleasesFixture = [
  {
    id: 1000,
    name: "v1.0.0",
    tag_name: "v1.0.0",
    body: "Initial release",
    draft: false,
    prerelease: false,
    published_at: "2024-01-10T10:00:00Z",
    html_url:
      "https://github.com/octocat/awesome-github-app/releases/tag/v1.0.0",
    zipball_url: "https://github.com/octocat/awesome-github-app/zipball/v1.0.0",
    tarball_url: "https://github.com/octocat/awesome-github-app/tarball/v1.0.0",
    author: "octocat",
  },
  {
    id: 1001,
    name: "v0.9.0-beta",
    tag_name: "v0.9.0-beta",
    body: "Beta release",
    draft: false,
    prerelease: true,
    published_at: "2024-01-01T10:00:00Z",
    html_url:
      "https://github.com/octocat/awesome-github-app/releases/tag/v0.9.0-beta",
    zipball_url:
      "https://github.com/octocat/awesome-github-app/zipball/v0.9.0-beta",
    tarball_url:
      "https://github.com/octocat/awesome-github-app/tarball/v0.9.0-beta",
    author: "octocat",
  },
];

export const workflowsFixture = [
  {
    id: 100,
    name: "CI",
    path: ".github/workflows/ci.yml",
    state: "active",
    created_at: "2024-01-01T00:00:00Z",
    updated_at: "2024-01-15T00:00:00Z",
    url: "https://api.github.com/repos/octocat/awesome-github-app/actions/workflows/100",
    html_url:
      "https://github.com/octocat/awesome-github-app/actions/workflows/ci.yml",
  },
  {
    id: 101,
    name: "Deploy",
    path: ".github/workflows/deploy.yml",
    state: "active",
    created_at: "2024-01-05T00:00:00Z",
    updated_at: "2024-01-10T00:00:00Z",
    url: "https://api.github.com/repos/octocat/awesome-github-app/actions/workflows/101",
    html_url:
      "https://github.com/octocat/awesome-github-app/actions/workflows/deploy.yml",
  },
];

export const workflowRunsFixture = [
  {
    id: 10000,
    name: "CI",
    head_branch: "main",
    head_sha: "abc123",
    run_number: 42,
    event: "push",
    status: "completed",
    conclusion: "success",
    workflow_id: 100,
    created_at: "2024-01-15T10:00:00Z",
    updated_at: "2024-01-15T10:05:00Z",
    html_url:
      "https://github.com/octocat/awesome-github-app/actions/runs/10000",
  },
  {
    id: 10001,
    name: "Deploy",
    head_branch: "main",
    head_sha: "abc123",
    run_number: 15,
    event: "workflow_dispatch",
    status: "in_progress",
    conclusion: null,
    workflow_id: 101,
    created_at: "2024-01-15T11:00:00Z",
    updated_at: "2024-01-15T11:01:00Z",
    html_url:
      "https://github.com/octocat/awesome-github-app/actions/runs/10001",
  },
];
