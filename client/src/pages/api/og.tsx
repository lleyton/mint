import { ImageResponse } from '@vercel/og';
import clsx from 'clsx';
import { NextRequest } from 'next/server';

import { truncateThumbnailDescription } from '@/utils/getOGImageEndpoint';

export const config = {
  runtime: 'edge',
};

const interFontExtraBoldImport = fetch(
  new URL('../../../assets/Inter-ExtraBold.ttf', import.meta.url)
).then((res) => res.arrayBuffer());
const interFontMediumImport = fetch(
  new URL('../../../assets/Inter-Medium.ttf', import.meta.url)
).then((res) => res.arrayBuffer());

export default async function handler(req: NextRequest) {
  try {
    const [interFontMedium, interFontExtraBold] = await Promise.all([
      interFontMediumImport,
      interFontExtraBoldImport,
    ]);
    const { searchParams } = new URL(req.url);

    const title = searchParams.get('title');
    const description = searchParams.get('description');
    const rightGradientColor = searchParams.get('leftGradientColor');
    const leftGradientColor = searchParams.get('rightGradientColor');
    const isDark = searchParams.get('isDark');
    const logo = searchParams.get('logo');
    const backgroundColor = searchParams.get('backgroundColor');

    if (!backgroundColor) {
      throw 'No background color provided';
    }

    const shouldHideLogo =
      title?.length && title.length > 20 && description?.length && description.length > 60;

    return new ImageResponse(
      (
        <div
          style={{
            height: '100%',
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            backgroundColor,
            fontFamily: 'Inter var',
          }}
        >
          <div tw="relative flex flex-col w-full px-26 py-24 h-full">
            <div tw="flex flex-1">
              {/* eslint-disable-next-line */}
              {logo && !shouldHideLogo && <img tw="h-12" src={logo} alt="Logo" />}
            </div>
            <div tw="flex flex-col text-left">
              <span
                tw="w-24 h-2"
                style={{
                  backgroundImage: `linear-gradient(to right, ${leftGradientColor}, ${rightGradientColor})`,
                }}
              ></span>
              <span
                tw={clsx(
                  'mt-12 font-bold tracking-tight text-base',
                  isDark ? 'text-slate-100' : 'text-slate-900'
                )}
                style={{ fontSize: '86px', lineHeight: '90px' }}
              >
                {title}
              </span>
              <span
                tw={clsx(
                  'mt-5 text-4xl font-medium leading-normal',
                  isDark ? 'text-slate-400' : 'text-slate-500'
                )}
              >
                {truncateThumbnailDescription(description)}
              </span>
            </div>
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 630,
        headers: {
          'Cache-Control': 's-maxage=300',
        },
        fonts: [
          {
            name: 'Inter',
            data: interFontExtraBold,
            style: 'normal',
            weight: 700,
          },
          {
            name: 'Inter',
            data: interFontMedium,
            style: 'normal',
            weight: 500,
          },
        ],
      }
    );
  } catch (e) {
    console.error(e);
    return new Response(`Failed to generate the image`, {
      status: 500,
    });
  }
}
