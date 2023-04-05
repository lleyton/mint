import { navigationConfigSchema } from "../schemas/navigation";
import { NavigationEntry, NavigationType } from "../types/navigation";
import { VersionsType } from "../types/versions";
import { MintValidationResults } from "./common";

export function flattenNavigationVersions(
  nav: NavigationEntry[],
  versions: string[] = []
): string[] {
  nav.forEach((val) => {
    if (val == null || typeof val === "string") {
      return versions;
    }

    if (val.version) {
      versions.push(val.version);
    }

    if (!Array.isArray(val.pages)) {
      return versions;
    }

    return flattenNavigationVersions(val.pages, versions);
  });

  return versions;
}

export function validateVersionsInNavigation(
  navigation: NavigationType[] | undefined,
  versions: VersionsType | undefined = []
) {
  const results = new MintValidationResults();
  if (
    navigation == null ||
    navigationConfigSchema.safeParse(navigation).success === false
  ) {
    return results;
  }

  const versionsFromNavigation = flattenNavigationVersions(navigation);
  versionsFromNavigation.forEach((v) => {
    if (!versions!.includes(v)) {
      results.errors.push(
        `Version ${v} is not included in the versions array, but is used in the navigation. Please add ${v} to the versions array.`
      );
    }
  });

  if (versionsFromNavigation.length === 0 && versions.length > 0) {
    results.warnings.push(
      "You have versions defined in the config, but no versions are used in the navigation."
    );
  }

  navigation.forEach((nav) => {
    results.warnings.push(...warnVersionNesting(nav, null));
  });

  return results;
}

function warnVersionNesting(
  navigation: NavigationEntry,
  currentVersion: string | null | undefined
): string[] {
  if (typeof navigation === "string") {
    return [];
  }

  const warnings = [];

  if (
    navigation.version &&
    currentVersion != null &&
    navigation.version !== currentVersion
  ) {
    warnings.push(
      `Please do not set versions on groups nested inside a group that already has a version. The group "${navigation.group}" has version "${navigation.version}" set and it is nested in a group that has the version "${currentVersion}" set.`
    );
  }

  if (navigation.pages) {
    return warnings.concat(
      navigation.pages
        .map((entry) =>
          warnVersionNesting(entry, currentVersion || navigation.version)
        )
        .flat()
        .filter(Boolean) as string[]
    );
  }

  return [];
}
