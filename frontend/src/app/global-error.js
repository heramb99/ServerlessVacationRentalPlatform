'use client';

import Error from 'next/error';
import { useEffect } from 'react';

export default function GlobalError({ error, params }) {
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  return (
    <html lang={params.locale}>
      <body>
        {/* This is the default Next.js error component but it doesn't allow omitting the statusCode property yet. */}
        <Error statusCode={undefined} />
      </body>
    </html>
  );
}
