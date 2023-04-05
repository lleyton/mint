#!/bin/bash

if [[ -z $(git diff --name-only HEAD~1 HEAD -- .) ]] ; then
  echo "🛑 - Build cancelled. No changes to the client folder."
  exit 0;
fi

if [[ "$VERCEL_ENV" == "production" ]] ; then
  echo "✅ - Build can proceed. Running in Vercel."
  exit 1;

else
  echo "🛑 - Build cancelled. Not running in Vercel."
  exit 0;
fi
