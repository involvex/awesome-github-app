import {
  isViewableTextFile,
  languageFromFileName,
} from "../../src/lib/api/hooks/useFileContent";
import { parseNotificationTarget } from "../../src/lib/navigation";

function thread(url: string, fullName = "owner/repo") {
  return {
    subject: { url },
    repository: { full_name: fullName },
  } as never;
}

describe("parseNotificationTarget", () => {
  test("parses issue API urls to repo routes", () => {
    const target = parseNotificationTarget(
      thread("https://api.github.com/repos/octo/hello/issues/42"),
    );
    expect(target).toMatchObject({
      route: "/repo/octo/hello",
      owner: "octo",
      repo: "hello",
      number: 42,
      kind: "issue",
    });
  });

  test("parses pull API urls", () => {
    const target = parseNotificationTarget(
      thread("https://api.github.com/repos/octo/hello/pulls/7"),
    );
    expect(target).toMatchObject({ kind: "pull", number: 7 });
  });

  test("falls back to repository full_name", () => {
    const target = parseNotificationTarget(thread(""));
    expect(target).toMatchObject({ route: "/repo/owner/repo" });
  });

  test("returns null when nothing parseable", () => {
    expect(
      parseNotificationTarget({ subject: {}, repository: {} } as never),
    ).toBeNull();
  });
});

describe("isViewableTextFile", () => {
  test("allows code and markdown", () => {
    expect(isViewableTextFile("index.ts", 1000)).toBe(true);
    expect(isViewableTextFile("README.md", 5000)).toBe(true);
  });

  test("rejects binary", () => {
    expect(isViewableTextFile("logo.png", 100)).toBe(false);
    expect(isViewableTextFile("app.zip", 100)).toBe(false);
  });
});

describe("languageFromFileName", () => {
  test("maps common extensions", () => {
    expect(languageFromFileName("a.ts")).toBe("TypeScript");
    expect(languageFromFileName("b.md")).toBe("Markdown");
    expect(languageFromFileName("Dockerfile")).toBe("Dockerfile");
  });
});
