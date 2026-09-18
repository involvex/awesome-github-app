import {
  buildNotificationItems,
  buildPrInboxPayload,
  buildReleasesPayload,
} from "../../src/lib/widgets/sync";
import type { NotificationThread } from "../../src/lib/api/hooks/useNotifications";
import type { Release } from "../../src/lib/api/hooks/useReleases";
import type { AssignedPr } from "../../src/lib/api/prInbox";
import addFormats from "ajv-formats";
import * as path from "path";
import * as fs from "fs";
import Ajv from "ajv";

const schemaPath = path.resolve(
  __dirname,
  "../../src/lib/widgets/widget-schema.json",
);
const schema = JSON.parse(fs.readFileSync(schemaPath, "utf-8"));

const ajv = new Ajv({ allErrors: true, strict: false });
addFormats(ajv);

// Compile validators for each widget's JSON payload
const validateNotificationItems = ajv.compile(
  schema.definitions.WidgetNotificationItem,
);
const validateReleaseItems = ajv.compile(schema.definitions.WidgetReleaseItem);
const validatePrItems = ajv.compile(schema.definitions.WidgetPrItem);

function makeThread(
  id: string,
  unread: boolean,
  repo = "owner/repo",
  title = "Fix bug",
  type = "PullRequest",
): NotificationThread {
  return {
    id,
    unread,
    repository: { full_name: repo },
    subject: { title, type, url: `https://github.com/${repo}/pull/1` },
  } as unknown as NotificationThread;
}

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
    assets: [{ download_count: 100 }, { download_count: 200 }],
  } as Release;
}

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

describe("Widget payload JSON schema validation", () => {
  describe("NotificationWidget items", () => {
    test("valid items pass schema", () => {
      const threads = [
        makeThread("1", true, "octo/hello", "Fix bug", "PullRequest"),
        makeThread("2", true, "octo/world", "Add feature", "Issue"),
        makeThread("3", true, "octo/foo", "Release v1", "Release"),
      ];
      const items = buildNotificationItems(threads);
      items.forEach(item => {
        const valid = validateNotificationItems(item);
        if (!valid) {
          console.log("Validation errors:", validateNotificationItems.errors);
        }
        expect(valid).toBe(true);
      });
    });

    test("items have required fields", () => {
      const items = buildNotificationItems([makeThread("1", true)]);
      expect(items[0]).toHaveProperty("repo_full_name");
      expect(items[0]).toHaveProperty("title");
      expect(items[0]).toHaveProperty("type");
      expect(items[0]).toHaveProperty("url");
    });
  });

  describe("ReleasesWidget items", () => {
    test("valid items pass schema", () => {
      const releases = [makeRelease(1, "owner/repo")];
      const items = buildReleasesPayload(releases);
      items.forEach(item => {
        const valid = validateReleaseItems(item);
        expect(valid).toBe(true);
      });
    });

    test("items include assets_count and downloads", () => {
      const items = buildReleasesPayload([makeRelease(1, "owner/repo")]);
      expect(items[0]).toHaveProperty("assets_count");
      expect(items[0]).toHaveProperty("downloads");
      expect(items[0].assets_count).toBe(2);
      expect(items[0].downloads).toBe(300);
    });
  });

  describe("PrInboxWidget items", () => {
    test("valid items pass schema", () => {
      const prs = [
        makePr(1, "A", { source: "assigned", draft: false }),
        makePr(2, "B", { source: "review", draft: false }),
        makePr(3, "C", { source: "assigned", draft: true }),
      ];
      const items = buildPrInboxPayload(prs);
      items.forEach(item => {
        const valid = validatePrItems(item);
        expect(valid).toBe(true);
      });
    });

    test("items include draft and source fields", () => {
      const items = buildPrInboxPayload([
        makePr(1, "Draft PR", { draft: true, source: "assigned" }),
      ]);
      expect(items[0].draft).toBe(true);
      expect(items[0].source).toBe("assigned");
    });
  });
});
