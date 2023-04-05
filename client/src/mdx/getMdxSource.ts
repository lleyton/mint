import type { Root } from 'mdast';
import { serialize } from 'next-mdx-remote/serialize';
import remarkGfm from 'remark-gfm';
import withSmartypants from 'remark-smartypants';

import withApiComponents from './rehype/withApiComponents.js';
import withCodeBlocks from './rehype/withCodeBlocks';
import withLayouts from './rehype/withLayouts.js';
import withListRoles from './rehype/withListRoles.js';
import withRawComponents from './rehype/withRawComponents.js';
import withRemoveUnknownJsx from './rehype/withRemoveUnknownJsx';
import withSyntaxHighlighting from './rehype/withSyntaxHighlighting.js';
import remarkMdxInjectSnippets from './remark/remarkMdxInjectSnippets';
import withFrames from './remark/withFrames.js';
import withRemoveImports from './remark/withRemoveImports';
import withRemoveJavascript from './remark/withRemoveJavascript';
import withTableOfContents from './remark/withTableOfContents.js';

const getMdxSource = async (
  pageContents: string,
  data: Record<string, unknown>,
  snippetTreeMap: Record<string, Root> = {}
) => {
  return serialize(pageContents, {
    scope: data,
    mdxOptions: {
      remarkPlugins: [
        [remarkMdxInjectSnippets, snippetTreeMap],
        remarkGfm,
        withRemoveJavascript,
        withFrames,
        withTableOfContents,
        withSmartypants,
        withRemoveImports,
      ],
      rehypePlugins: [
        withRemoveUnknownJsx,
        withCodeBlocks,
        [
          withSyntaxHighlighting,
          {
            ignoreMissing: true, // Ignore errors when no language is found
          },
        ],
        withListRoles,
        withApiComponents,
        withRawComponents,
        withLayouts,
      ],
      format: 'mdx',
      useDynamicImport: true,
    },
    parseFrontmatter: true,
  });
};

export default getMdxSource;
