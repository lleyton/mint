import { useContext, useEffect, useState } from 'react';

import { ConfigContext } from '@/context/ConfigContext';
import { useCurrentPath } from '@/hooks/useCurrentPath';
import IconButton, { FeedbackButtonIconType } from '@/ui/Feedback/IconButton';

const removeFirstSlash = (str: string): string => {
  if (str[0] === '/') {
    return str.substring(1);
  }

  return str;
};

export function UserFeedback() {
  const path = useCurrentPath();
  const { mintConfig } = useContext(ConfigContext);

  const [createIssueHref, setCreateIssueHref] = useState<string | null>(null);
  const [createSuggestHref, setCreateSuggestHref] = useState<string | null>(null);

  useEffect(() => {
    if (path && mintConfig?.repo?.github && !mintConfig.repo.github.isPrivate) {
      const {
        owner,
        repo,
        deployBranch,
        contentDirectory: deploymentPath,
      } = mintConfig.repo.github;

      let urlPath;
      if (!deploymentPath) {
        urlPath = '';
      } else {
        urlPath = `${deploymentPath}/`;
      }

      setCreateSuggestHref(
        `https://github.com/${owner}/${repo}/edit/${deployBranch}/${urlPath}${removeFirstSlash(
          `${path}.mdx`
        )}`
      );

      const issueTitle = 'Issue on docs';
      const body = `Path: ${path}`;

      setCreateIssueHref(
        `https://github.com/${owner}/${repo}/issues/new?title=${issueTitle}&body=${body}`
      );
    }
  }, [path, mintConfig]);

  if (mintConfig?.hideFeedbackButtons === true) {
    return null;
  }

  return (
    <div className="flex items-center space-x-2">
      {createSuggestHref && (
        <IconButton
          type={FeedbackButtonIconType.Edit}
          tooltip="Edit this page"
          href={createSuggestHref}
          className="relative w-fit flex items-center p-1.5 group"
        />
      )}
      {createIssueHref && (
        <IconButton
          type={FeedbackButtonIconType.Alert}
          href={createIssueHref}
          tooltip="Raise an issue"
          className="relative w-fit flex items-center p-1.5 group fill-slate-500 dark:fill-slate-400 hover:fill-slate-700 dark:hover:fill-slate-200 dark:hover:text-slate-300"
        />
      )}
    </div>
  );
}
