import {
  buildNotificationItems,
  buildNotificationTitles,
  buildPrInboxPayload,
  buildReleasesPayload,
  formatWidgetTimestamp,
} from "../../src/lib/widgets/sync";
import type { NotificationThread } from "../../src/lib/api/hooks/useNotifications";
import type { Release } from "../../src/lib/api/hooks/useReleases";
import { repoFullNameFromUrl } from "../../src/lib/api/prInbox";
import { filterPrInboxItems } from "../../src/lib/api/prInbox";
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
        name: "Release 1",
        published_at: "2026-09-02T00:00:00Z",
        assets_count: 0,
        downloads: 0,
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
  test("returns unread titles only, capped at 5", () => {
    const threads = [
      makeThread("1", true, "a/b", "One"),
      makeThread("2", false, "a/b", "Read already"),
      makeThread("3", true, "c/d", "Three"),
      makeThread("4", true, "e/f", "Four"),
      makeThread("5", true, "g/h", "Five"),
      makeThread("6", true, "i/j", "Six"),
      makeThread("7", true, "k/l", "Seven"),
    ];
    const titles = buildNotificationTitles(threads);
    expect(titles).toHaveLength(5);
    expect(titles.join(" ")).not.toContain("Read already");
  });

  test("prefixes titles with notification type", () => {
    const threads = [makeThread("1", true, "a/b", "One")];
    threads[0].subject = { title: "One", type: "PullRequest" } as never;
    expect(buildNotificationTitles(threads)[0]).toMatch(/^PR · /);
  });

  test("truncates long titles", () => {
    const threads = [makeThread("1", true, "owner/repo", "x".repeat(200))];
    expect(buildNotificationTitles(threads)[0].length).toBeLessThanOrEqual(80);
  });
});

function makePr(
  id: number,
  title = "Add feature",
  extra: Partial<AssignedPr> = {},
): AssignedPr {
  return {
    id,
    number: id,
    title,
    updated_at: "2026-09-03T00:00:00Z",
    html_url: `https://github.com/owner/repo/pull/${id}`,
    repo_full_name: "owner/repo",
    draft: false,
    source: "assigned",
    ...extra,
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
        draft: false,
        source: "assigned",
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

describe("buildNotificationItems", () => {
  test("returns structured unread items capped at 5", () => {
    const threads = [
      makeThread("1", true),
      makeThread("2", false),
      makeThread("3", true),
      makeThread("4", true),
      makeThread("5", true),
      makeThread("6", true),
      makeThread("7", true),
    ];
    const items = buildNotificationItems(threads);
    expect(items).toHaveLength(5);
    expect(items[0]).toMatchObject({
      repo_full_name: "owner/repo",
      title: "Fix bug",
    });
  });
});

describe("filterPrInboxItems", () => {
  const prs = [
    makePr(1, "A", { source: "assigned", draft: false }),
    makePr(2, "B", { source: "review", draft: false }),
    makePr(3, "C", { source: "assigned", draft: true }),
  ];

  test("all returns everything", () => {
    expect(filterPrInboxItems(prs, { kind: "all" })).toHaveLength(3);
  });

  test("assigned excludes review-requested", () => {
    expect(
      filterPrInboxItems(prs, { kind: "assigned" }).map(p => p.id),
    ).toEqual([1, 3]);
  });

  test("review excludes assigned", () => {
    expect(filterPrInboxItems(prs, { kind: "review" }).map(p => p.id)).toEqual([
      2,
    ]);
  });

  test("draft returns only drafts", () => {
    expect(filterPrInboxItems(prs, { kind: "draft" }).map(p => p.id)).toEqual([
      3,
    ]);
  });
});

describe("formatWidgetTimestamp", () => {
  test("labels recent syncs relatively", () => {
    expect(formatWidgetTimestamp(new Date())).toBe("Updated just now");
    expect(formatWidgetTimestamp(new Date(Date.now() - 5 * 60000))).toBe(
      "Updated 5m ago",
    );
    expect(formatWidgetTimestamp(new Date(Date.now() - 3 * 3600000))).toBe(
      "Updated 3h ago",
    );
  });
});
