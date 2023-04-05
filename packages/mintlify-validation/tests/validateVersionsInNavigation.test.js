import {
  validateVersionsInNavigation,
  flattenNavigationVersions,
} from "../src/utils/validateVersionsInNavigation";

describe("validateVersionsInNavigation", () => {
  test("returns no errors when there are no versions", () => {
    const results = validateVersionsInNavigation([
      {
        group: "1",
        pages: ["page"],
      },
    ]);
    expect(results.errors.length).toEqual(0);
    expect(results.warnings.length).toEqual(0);
  });

  test("returns no errors when versions are used correctly", () => {
    const results = validateVersionsInNavigation(
      [
        {
          group: "1",
          pages: ["page"],
          version: "v1",
        },
      ],
      ["v1"]
    );
    expect(results.errors.length).toEqual(0);
    expect(results.warnings.length).toEqual(0);
  });

  test("returns error when the navigation versions is not in the versions array", () => {
    const results = validateVersionsInNavigation(
      [
        {
          group: "1",
          pages: ["page"],
          version: "2",
        },
      ],
      ["1"]
    );
    expect(results.errors.length).toEqual(1);
    expect(results.warnings.length).toEqual(0);
  });

  test("returns warning when versions are defined but not used", () => {
    const results = validateVersionsInNavigation(
      [
        {
          group: "1",
          pages: ["page"],
        },
      ],
      ["v1"]
    );
    expect(results.errors.length).toEqual(0);
    expect(results.warnings.length).toEqual(1);
  });

  test("returns warning when versions are set on groups nested inside a group with a version", () => {
    const results = validateVersionsInNavigation(
      [
        {
          group: "Parent Group",
          pages: [
            "page",
            {
              group: "Child Group",
              pages: [
                "nested-page",
                {
                  group: "Child Child Group",
                  pages: ["nested-nested-page"],
                  version: "v3",
                },
              ],
              version: "v2",
            },
          ],
          version: "v1",
        },
      ],
      ["v1", "v2", "v3"]
    );
    expect(results.errors.length).toEqual(0);
    expect(results.warnings.length).toEqual(2);
    expect(results.warnings[0]).toEqual(
      'Please do not set versions on groups nested inside a group that already has a version. The group "Child Group" has version "v2" set and it is nested in a group that has the version "v1" set.'
    );
    expect(results.warnings[1]).toEqual(
      'Please do not set versions on groups nested inside a group that already has a version. The group "Child Child Group" has version "v3" set and it is nested in a group that has the version "v1" set.'
    );
  });
});

describe("flattenNavigationVersions", () => {
  test("returns the correct values", () => {
    const results = flattenNavigationVersions([
      {
        group: "1",
        pages: [""],
        version: "1",
      },
    ]);
    expect(results).toEqual(["1"]);
  });

  test("returns empty when there's no versions", () => {
    const results = flattenNavigationVersions([
      {
        group: "1",
        pages: [""],
      },
    ]);
    expect(results).toEqual([]);
  });

  test("returns recursive version values", () => {
    const results = flattenNavigationVersions([
      {
        group: "1",
        pages: [
          {
            group: "1a",
            pages: [
              {
                group: "1b",
                pages: "pageString",
                version: "2",
              },
            ],
            version: "3",
          },
        ],
        version: "1",
      },
    ]);
    expect(results).toEqual(["1", "3", "2"]);
  });

  test("skips over null values in pages array", () => {
    const results = flattenNavigationVersions([
      {
        group: "1",
        pages: [null, "", undefined],
        version: "1",
      },
    ]);
    expect(results).toEqual(["1"]);
  });
});
