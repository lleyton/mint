import { getAllMetaTags } from '@/utils/getAllMetaTags';
import { getOGImageEndpoint } from '@/utils/getOGImageEndpoint';

describe('getAllMetaTags', () => {
  test('gets tags from file before reading config and includes default values', () => {
    expect(
      getAllMetaTags(
        { 'og:title': 'My Title' },
        {
          name: 'Site Name',
          metadata: { 'og:title': 'Config Title', 'og:site_name': 'Meta Site Name' },
        },
        'https://mintlify.com/docs/api/og?title=My%20Title'
      )
    ).toEqual({
      'og:title': 'My Title',
      'og:site_name': 'Meta Site Name',
      'og:type': 'website',
      'twitter:card': 'summary_large_image',
      'twitter:title': 'Site Name', // Default title when "title" is undefined in the page metadata
      'og:image': 'https://mintlify.com/docs/api/og?title=My%20Title',
      'twitter:image': 'https://mintlify.com/docs/api/og?title=My%20Title',
      charset: 'utf-8',
    });
  });

  test('generates default title from site name', () => {
    expect(
      getAllMetaTags(
        { title: 'My Title', description: 'Description' },
        {
          name: 'Site Name',
          metadata: {},
        },
        'https://mintlify.com/docs/api/og?title=My%20Title&description=Description'
      )
    ).toEqual({
      'og:title': 'My Title - Site Name',
      description: 'Description',
      'og:description': 'Description',
      'og:site_name': 'Site Name',
      'twitter:card': 'summary_large_image',
      'twitter:title': 'My Title - Site Name',
      'og:image': 'https://mintlify.com/docs/api/og?title=My%20Title&description=Description',
      'twitter:image': 'https://mintlify.com/docs/api/og?title=My%20Title&description=Description',
      'og:type': 'website',
      charset: 'utf-8',
    });
  });

  test('check that og image endpoint is valid', () => {
    expect(
      getOGImageEndpoint(
        'http://mintlify.mintlify.app',
        {
          title: 'My Title',
          description: 'Description: should be something that is URL friendly.',
        },
        {
          name: 'Site Name',
        }
      )
    ).toContain(
      '/api/og?title=My+Title&description=Description%3A+should+be+something+that+is+URL+friendly.'
    );
  });
});
