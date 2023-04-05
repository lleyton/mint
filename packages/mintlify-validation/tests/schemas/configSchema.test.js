import { configSchema } from "../../src/schemas/config";

describe("configSchema", () => {
  test("works when only name, favicon, navigation, and colors are defined", () => {
    const data = configSchema.safeParse({
      name: "Name",
      favicon: "favicon.svg",
      colors: { primary: "#ff0000" },
      navigation: [{ group: "Group", pages: ["page"] }],
    });
    expect(data.success).toEqual(true);
  });

  test("works when defining a button cta and valid api method", () => {
    const data = configSchema.safeParse({
      name: "Name",
      favicon: "favicon.svg",
      colors: { primary: "#ff0000" },
      navigation: [{ group: "Group", pages: ["page"] }],
      topAnchor: {
        name: "Anchor",
        icon: "icon",
        iconType: "solid",
      },
      topbarCtaButton: {
        name: "Button",
        url: "/internal/link",
      },
      api: {
        auth: {
          method: "bearer",
        },
      },
      topbarLinks: [
        {
          name: "Link Text",
          url: "https://external.link",
        },
        {
          name: "Link Text",
          url: "/other/internal/link",
        },
      ],
    });
    expect(data.success).toEqual(true);
  });

  test("works when defining a GitHub cta", () => {
    const data = configSchema.safeParse({
      name: "Name",
      favicon: "favicon.svg",
      colors: { primary: "#ff0000" },
      navigation: [{ group: "Group", pages: ["page"] }],
      topbarCtaButton: {
        type: "github",
        url: "https://github.com/org/repo",
      },
    });
    expect(data.success).toEqual(true);
  });

  test("works when defining bearer authentication", () => {
    const data = configSchema.safeParse({
      name: "Name",
      favicon: "favicon.svg",
      colors: { primary: "#ff0000" },
      api: {
        auth: {
          method: "bearer",
        },
      },
      navigation: [{ group: "Group", pages: ["page"] }],
      topbarCtaButton: {
        type: "github",
        url: "https://github.com/org/repo",
      },
    });
    expect(data.success).toEqual(true);
  });

  test("fails when GitHub cta is an invalid link", () => {
    const data = configSchema.safeParse({
      name: "Name",
      favicon: "favicon.svg",
      colors: { primary: "#ff0000" },
      navigation: [{ group: "Group", pages: ["page"] }],
      topbarCtaButton: {
        type: "github",
        url: "",
      },
    });
    expect(data.success).toEqual(false);
  });

  test("fails when auth method is not supported", () => {
    const data = configSchema.safeParse({
      name: "Name",
      favicon: "favicon.svg",
      colors: { primary: "#ff0000" },
      navigation: [{ group: "Group", pages: ["page"] }],
      api: {
        auth: {
          method: "invalid",
        },
      },
    });
    expect(data.success).toEqual(false);
    expect(data.error.errors[0].message).toEqual(
      "api.auth.method has to be one of: bearer, basic, key"
    );
  });

  test("fails if user attempts to define injected property that's assigned internally", () => {
    const data = configSchema.safeParse({
      name: "Name",
      favicon: "favicon.svg",
      colors: { primary: "#ff0000" },
      navigation: [{ group: "Group", pages: ["page"] }],
      __injected: "any value",
    });
    expect(data.success).toEqual(false);
    expect(data.error.errors[0].message).toEqual(
      "Do not add __injected to mint.json. Mintlify uses this property internally."
    );
  });
});
