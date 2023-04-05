import { useEffect } from 'react';

import { MDXContentContextType } from '@/context/MDXContentContext';
import { MDXContentActionEnum } from '@/enums/MDXContentActionEnum';

/**
 * Registers scroll event to get the current section and dispatch state update.
 */
export const useCurrentTableOfContentsSection = (ctx: MDXContentContextType) => {
  const [state, dispatch] = ctx;
  const { tableOfContents, headings } = state;
  useEffect(() => {
    if (tableOfContents.length === 0 || headings.length === 0) return;
    function onScroll() {
      const style = window.getComputedStyle(document.documentElement);
      let scrollMt = parseFloat(style.getPropertyValue('--scroll-mt').match(/[\d.]+/)?.[0] ?? '0');
      const fontSize = parseFloat(style.fontSize.match(/[\d.]+/)?.[0] ?? '16');
      scrollMt = scrollMt * fontSize;

      const sortedHeadings = headings.concat([]).sort((a, b) => (a?.top ?? 0) - (b?.top ?? 0));
      const top = window.pageYOffset + scrollMt + 1;
      let current = sortedHeadings[0].id;
      for (let i = 0; i < sortedHeadings.length; i++) {
        if (top >= (sortedHeadings[i]?.top ?? 0)) {
          current = sortedHeadings[i].id;
        }
      }
      dispatch({
        type: MDXContentActionEnum.SET_CURRENT_TABLE_OF_CONTENTS_SECTION,
        payload: current,
      });
    }
    const options: AddEventListenerOptions = {
      capture: true,
      passive: true,
    };
    window.addEventListener('scroll', onScroll, options);
    onScroll();
    return () => {
      window.removeEventListener('scroll', onScroll, options);
    };
  }, [dispatch, headings, tableOfContents]);

  return [state, dispatch] as MDXContentContextType;
};
