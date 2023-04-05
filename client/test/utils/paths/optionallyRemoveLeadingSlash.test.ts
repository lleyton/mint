import { optionallyRemoveLeadingSlash } from '@/utils/paths/leadingSlashHelpers';

describe('optionallyRemoveLeadingSlash', () => {
  test('only removes one leading slash', () => {
    expect(optionallyRemoveLeadingSlash('///')).toEqual('//');
  });

  test('ignores other characters', () => {
    expect(optionallyRemoveLeadingSlash('abc///')).toEqual('abc///');
  });
});
