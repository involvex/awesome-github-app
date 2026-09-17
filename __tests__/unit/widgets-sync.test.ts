import {
  buildNotificationTitles,
  buildPrInboxPayload,
  buildReleasesPayload,
} from "../../src/lib/widgets/sync";
import type { NotificationThread } from "../../src/lib/api/hooks/useNotifications";
import type { Release } from "../../src/lib/api/hooks/useReleases";
import { repoFullNameFromUrl } from "../../src/lib/api/prInbox";
import type { AssignedPr } from "../../src/lib/api/prInbox";

function makeRelease(id: number, fullName: string): Release {
  const [owner, name] = fullName.split("/");
  return {
    id,
    name: `Release ${id}`,
    tag_name: `v${id}.0.0`,
    body: null,
    draft: false,
    prerelease: false,
    created_at: "2026-09-01T00:00:00Z",
    published_at: "2026-09-02T00:00:00Z",
    html_url: `https://github.com/${fullName}/releases/tag/v${id}.0.0`,
    zipball_url: "",
    tarball_url: "",
    author: { login: owner, avatar_url: "" },
    repo: { id, name, full_name: fullName },
  };
}

function makeThread(
  id: string,
  unread: boolean,
  repo = "owner/repo",
  title = "Fix bug",
): NotificationThread {
  return {
    id,
    unread,
    repository: { full_name: repo },
    subject: { title },
  } as unknown as NotificationThread;
}

describe("buildReleasesPayload", () => {
  test("maps to token-free widget items", () => {
    const payload = buildReleasesPayload([makeRelease(1, "owner/repo")]);
    expect(payload).toEqual([
      {
        id: 1,
        repo_full_name: "owner/repo",
        tag_name: "v1.0.0",
        published_at: "2026-09-02T00:00:00Z",
      },
    ]);
  });

  test("caps at 10 items", () => {
    const releases = Array.from({ length: 15 }, (_, i) =>
      makeRelease(i + 1, `owner/repo${i + 1}`),
    );
    expect(buildReleasesPayload(releases)).toHaveLength(10);
  });
});

describe("buildNotificationTitles", () => {
  test("returns unread titles only, capped at 3", () => {
    const threads = [
      makeThread("1", true, "a/b", "One"),
      makeThread("2", false, "a/b", "Read already"),
      makeThread("3", true, "c/d", "Three"),
      makeThread("4", true, "e/f", "Four"),
      makeThread("5", true, "g/h", "Five"),
    ];
    const titles = buildNotificationTitles(threads);
    expect(titles).toHaveLength(3);
    expect(titles[0]).toBe("a/b: One");
    expect(titles.join(" ")).not.toContain("Read already");
  });

  test("truncates long titles", () => {
    const threads = [makeThread("1", true, "owner/repo", "x".repeat(200))];
    expect(buildNotificationTitles(threads)[0].length).toBeLessThanOrEqual(80);
  });
});

function makePr(id: number, title = "Add feature"): AssignedPr {
  return {
    id,
    number: id,
    title,
    updated_at: "2026-09-03T00:00:00Z",
    html_url: `https://github.com/owner/repo/pull/${id}`,
    repo_full_name: "owner/repo",
  };
}

describe("buildPrInboxPayload", () => {
  test("maps to token-free widget items", () => {
    const payload = buildPrInboxPayload([makePr(7)]);
    expect(payload).toEqual([
      {
        id: 7,
        repo_full_name: "owner/repo",
        number: 7,
        title: "Add feature",
        updated_at: "2026-09-03T00:00:00Z",
      },
    ]);
  });

  test("caps at 10 items and truncates long titles", () => {
    const prs = Array.from({ length: 12 }, (_, i) =>
      makePr(i + 1, "y".repeat(200)),
    );
    const payload = buildPrInboxPayload(prs);
    expect(payload).toHaveLength(10);
    expect(payload[0].title.length).toBeLessThanOrEqual(90);
  });
});

describe("repoFullNameFromUrl", () => {
  test("extracts owner/repo from the API url", () => {
    expect(repoFullNameFromUrl("https://api.github.com/repos/owner/repo")).toBe(
      "owner/repo",
    );
  });

  test("falls back to unknown", () => {
    expect(repoFullNameFromUrl(undefined)).toBe("unknown");
  });
});
