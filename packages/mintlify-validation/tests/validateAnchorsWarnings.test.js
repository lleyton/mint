import { validateAnchorsWarnings } from "../src/utils/validateAnchorsWarnings";

describe("validateAnchorsWarnings", () => {
  test("returns no warnings when valid", () => {
    const results = validateAnchorsWarnings(
      [
        {
          name: "Anchor",
          url: "folder",
        },
      ],
      [
        {
          group: "Group Name",
          pages: ["folder/page"],
        },
      ]
    );
    expect(results.errors.length).toEqual(0);
    expect(results.warnings.length).toEqual(0);
  });

  test("returns a warnings when there are no anchors", () => {
    const results = validateAnchorsWarnings([], []);
    expect(results.errors.length).toEqual(0);
    expect(results.warnings.length).toEqual(1);
  });

  test("returns a warnings when no pages match", () => {
    const results = validateAnchorsWarnings(
      [
        {
          name: "Anchor",
          url: "folder",
        },
      ],
      [
        {
          group: "Group Name",
          pages: ["page"],
        },
      ]
    );
    expect(results.errors.length).toEqual(0);
    expect(results.warnings.length).toEqual(1);
  });

  test("returns a warnings when no pages match in a nested navigation", () => {
    const results = validateAnchorsWarnings(
      [
        {
          name: "Anchor",
          url: "folder",
        },
      ],
      [
        {
          group: "Group Name",
          pages: [{ group: "Nested Group Name", pages: ["page"] }],
        },
      ]
    );
    expect(results.errors.length).toEqual(0);
    expect(results.warnings.length).toEqual(1);
  });

  test("no warning when pages match in a nested navigation", () => {
    const results = validateAnchorsWarnings(
      [
        {
          name: "Anchor",
          url: "folder",
        },
        {
          name: "Email Us",
          url: "mailto:test@example.org",
        },
      ],
      [
        {
          group: "Group Name",
          pages: [{ group: "Nested Group Name", pages: ["folder/page"] }],
        },
      ]
    );
    expect(results.errors.length).toEqual(0);
    expect(results.warnings.length).toEqual(0);
  });
});
