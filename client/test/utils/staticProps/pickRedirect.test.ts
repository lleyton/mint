import { pickRedirect } from '@/utils/staticProps/pickRedirect';

describe('pickRedirect', () => {
  test('finds first page in a folder', () => {
    expect(
      pickRedirect(
        [
          {
            group: 'Group Name',
            pages: [{ href: '/not-folder/page' }, { href: '/folder' }, { href: '/folder/page' }],
          },
        ],
        'folder'
      )
    ).toEqual({ destination: '/folder/page', permanent: false });
  });

  test('redirects home if there are no matches in the mint config', () => {
    expect(
      pickRedirect(
        [
          {
            group: 'Group Name',
            pages: [
              { href: '/first-page' },
              { href: '/random/page' },
              { href: '/other/random/page' },
            ],
          },
        ],
        'folder'
      )
    ).toEqual({ destination: '/first-page', permanent: true });
  });
});
