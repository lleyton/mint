import matter from "gray-matter";
import isAbsoluteUrl from "is-absolute-url";
import { remark } from "remark";
import remarkFrontmatter from "remark-frontmatter";
import remarkGfm from "remark-gfm";
import remarkMdx from "remark-mdx";
import { visit } from "unist-util-visit";

const createPage = async (
  pagePath: string,
  pageContent: string,
  contentDirectoryPath: string,
  openApiFiles: OpenApiFile[]
) => {
  const { data: metadata } = matter(pageContent);
  try {
    const parsedContent = await preParseMdx(pageContent, contentDirectoryPath);
    pageContent = parsedContent;
  } catch (error) {
    pageContent = `🚧 A parsing error occured. Please contact the owner of this website.`;
  }

  // Replace .mdx so we can pass file paths into this function
  const slug = pagePath.replace(/\.mdx?$/, "");
  let defaultTitle = slugToTitle(slug);
  let description: string;
  // Append data from OpenAPI if it exists
  if (metadata?.openapi) {
    const { title, description: openApiDescription } =
      getOpenApiTitleAndDescription(openApiFiles, metadata?.openapi);

    if (title) {
      defaultTitle = title;
    }
    if (openApiDescription) {
      description = openApiDescription;
    }
  }

  const pageMetadata = {
    title: defaultTitle,
    description,
    ...metadata,
    href: optionallyAddLeadingSlash(slug),
  };

  return {
    pageMetadata,
    pageContent,
    slug: removeLeadingSlash(slug),
  };
};

const preParseMdx = async (
  fileContent: string,
  contentDirectoryPath: string
) => {
  const removeContentDirectoryPath = (filePath: string) => {
    const pathArr = createPathArr(filePath);
    const contentDirectoryPathArr = createPathArr(contentDirectoryPath);
    contentDirectoryPathArr.reverse().forEach((dir: string, index: number) => {
      if (pathArr[index] === dir) {
        pathArr.pop();
      }
    });
    return "/" + pathArr.join("/");
  };

  const removeContentDirectoryPaths = () => {
    return (tree) => {
      visit(tree, (node) => {
        if (node == null) {
          return;
        }
        if (node.name === "img" || node.name === "source") {
          const srcAttrIndex = node.attributes.findIndex(
            (attr) => attr?.name === "src"
          );
          const nodeUrl = node.attributes[srcAttrIndex].value;
          if (
            // <img/> component
            srcAttrIndex !== -1 &&
            !isAbsoluteUrl(nodeUrl) &&
            !isDataString(nodeUrl)
          ) {
            node.attributes[srcAttrIndex].value =
              removeContentDirectoryPath(nodeUrl);
          }
        } else if (
          // ![]() format
          node.type === "image" &&
          node.url &&
          !isAbsoluteUrl(node.url) &&
          !isDataString(node.url)
        ) {
          node.url = removeContentDirectoryPath(node.url);
        }
      });
      return tree;
    };
  };

  const file = await remark()
    .use(remarkMdx)
    .use(remarkGfm)
    .use(remarkFrontmatter, ["yaml", "toml"])
    .use(removeContentDirectoryPaths)
    .process(fileContent);
  return String(file);
};

const removeLeadingSlash = (str: string) => {
  const path = createPathArr(str);
  return path.join("/");
};

const createPathArr = (path: string) => {
  return path.split("/").filter((dir) => dir !== "");
};

const isDataString = (str: string) => str.startsWith("data:");

const getOpenApiTitleAndDescription = (
  openApiFiles: OpenApiFile[],
  openApiMetaField: string
) => {
  const { operation } = getOpenApiOperationMethodAndEndpoint(
    openApiFiles,
    openApiMetaField
  );

  if (operation == null) {
    return {};
  }

  return {
    title: operation.summary,
    description: operation.description,
  };
};

const getOpenApiOperationMethodAndEndpoint = (
  openApiFiles: OpenApiFile[],
  openApiMetaField: string
) => {
  const { endpoint, method, filename } =
    extractMethodAndEndpoint(openApiMetaField);

  let path;

  openApiFiles?.forEach((file) => {
    const openApiFile = file.spec;
    const openApiPath = openApiFile.paths && openApiFile.paths[endpoint];
    const isFilenameOrNone = !filename || filename === file.filename;
    if (openApiPath && isFilenameOrNone) {
      path = openApiPath;
    }
  });

  if (path == null) {
    return {};
  }

  let operation;
  if (method) {
    operation = path[method.toLowerCase()];
  } else {
    const firstOperationKey = Object.keys(path)[0];
    operation = path[firstOperationKey];
  }

  return {
    operation,
    method,
    endpoint,
  };
};

const extractMethodAndEndpoint = (openApiMetaField: string) => {
  const methodRegex = /(get|post|put|delete|patch)\s/i;
  const trimmed = openApiMetaField.trim();
  const foundMethod = trimmed.match(methodRegex);

  const startIndexOfMethod = foundMethod
    ? openApiMetaField.indexOf(foundMethod[0])
    : 0;
  const endIndexOfMethod = foundMethod
    ? startIndexOfMethod + foundMethod[0].length - 1
    : 0;

  const filename = openApiMetaField.substring(0, startIndexOfMethod).trim();

  return {
    method: foundMethod ? foundMethod[0].slice(0, -1).toUpperCase() : undefined,
    endpoint: openApiMetaField.substring(endIndexOfMethod).trim(),
    filename: filename ? filename : undefined,
  };
};

function optionallyAddLeadingSlash(path: string) {
  if (path.startsWith("/")) {
    return path;
  }
  return "/" + path;
}

export const slugToTitle = (slug: string) => {
  const slugArr = slug.split("/");
  let defaultTitle = slugArr[slugArr.length - 1].split("-").join(" "); //replace all dashes
  defaultTitle = defaultTitle.split("_").join(" "); //replace all underscores
  defaultTitle = defaultTitle.charAt(0).toUpperCase() + defaultTitle.slice(1); //capitalize first letter
  return defaultTitle;
};

export default createPage;
