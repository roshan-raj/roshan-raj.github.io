#!/usr/bin/env bash
# Upload the site to S3.
#
#   scripts/deploy.sh            upload new and changed files
#   scripts/deploy.sh --delete   also remove files from the bucket that no longer exist here
#   scripts/deploy.sh --dryrun   show what would change, upload nothing
#
# Override the defaults with env vars: BUCKET=... PROFILE=... scripts/deploy.sh
set -euo pipefail

BUCKET="${BUCKET:-roshansidequest.com}"
PROFILE="${PROFILE:-macmini-raj}"

cd "$(dirname "$0")/.."

# Only the files the site needs: no repo files, editor config or this script
EXCLUDES=(
    --exclude ".*"
    --exclude "*/.*"
    --exclude "README.md"
    --exclude "scripts/*"
)

# Log in only when the SSO session has expired
if ! aws sts get-caller-identity --profile "$PROFILE" >/dev/null 2>&1; then
    aws sso login --profile "$PROFILE"
fi

echo "Uploading to s3://$BUCKET with profile $PROFILE"

# Assets: short cache, since file names don't change between deploys
aws s3 sync . "s3://$BUCKET" --profile "$PROFILE" \
    "${EXCLUDES[@]}" --exclude "*.html" \
    --cache-control "public, max-age=300" \
    "$@"

# HTML: always revalidate, so a new deploy shows up right away
aws s3 sync . "s3://$BUCKET" --profile "$PROFILE" \
    "${EXCLUDES[@]}" --exclude "*" --include "*.html" \
    --cache-control "no-cache" \
    "$@"

echo "Done: http://$BUCKET"
