import { navigationConfigSchema } from "../schemas/navigation";
import { NavigationType, NavigationEntry } from "../types/navigation";
import { AnchorsType } from "../types/anchors";
import { MintValidationResults } from "./common";

export function validateAnchorsWarnings(
  anchors: AnchorsType | undefined,
  navigation: NavigationType[] | undefined
) {
  const results = new MintValidationResults();
  if (anchors == undefined || !Array.isArray(anchors) || anchors.length === 0) {
    results.warnings.push(
      "Mintlify runs without anchors but most sites look better with at least one."
    );
  } else if (
    navigation &&
    navigationConfigSchema.safeParse(navigation).success === true
  ) {
    anchors.forEach((anchor) => {
      if (
        !anchor.url.startsWith("mailto:") &&
        !anchor.url.startsWith("http") &&
        !anchor.url.startsWith("https") &&
        !navigation.some((nav) => pageStartsWith(nav, anchor.url))
      ) {
        results.warnings.push(
          "No pages in the navigation match anchor " +
            anchor.url +
            " you should have at least one page that starts with " +
            anchor.url
        );
      }
    });
  }

  return results;
}

function pageStartsWith(navEntry: NavigationEntry, prefix: string): boolean {
  if (typeof navEntry === "string") {
    return navEntry.startsWith(prefix);
  } else if (navEntry.pages == undefined) {
    return false;
  } else {
    return navEntry.pages.some((entry: NavigationEntry) => {
      return pageStartsWith(entry, prefix);
    });
  }
}
