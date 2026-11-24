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
    --exclude "*.heic"
    --exclude "*.HEIC"
)

# data/life.js holds drafts until the TODOs are filled in; don't publish them by accident.
# Set ALLOW_DRAFTS=1 to deploy anyway.
if grep -q "TODO" data/life.js 2>/dev/null && [ "${ALLOW_DRAFTS:-0}" != "1" ]; then
    echo "data/life.js still has TODO placeholders:" >&2
    grep -n "TODO" data/life.js | head -5 >&2
    echo "Fill them in, or run with ALLOW_DRAFTS=1 to deploy anyway." >&2
    exit 1
fi

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

# HTML: always revalidate, so a new deploy shows up right away.
#
# The CDN in front of the bucket keeps CSS and JS for hours, so a changed file
# under the same name would keep serving the old copy. Each asset link in the
# uploaded index.html therefore gets a ?v=<hash of that file>: a changed file has
# a new address, and unchanged files stay cached. The index.html in the repo is
# left as it is; only the uploaded copy is stamped.
STAMPED="$(mktemp -d)/index.html"
trap 'rm -rf "$(dirname "$STAMPED")"' EXIT
cp index.html "$STAMPED"

grep -oE '(src|href)="(css|js|data)/[^"?]+"' index.html \
    | sed -E 's/^[a-z]+="//; s/"$//' | sort -u \
    | while read -r asset; do
        version="$(shasum "$asset" | cut -c1-8)"
        sed -i.bak "s|\"$asset\"|\"$asset?v=$version\"|g" "$STAMPED"
    done
rm -f "$STAMPED.bak"

DRYRUN=()
for arg in "$@"; do
    [ "$arg" = "--dryrun" ] && DRYRUN=(--dryrun)
done

aws s3 cp "$STAMPED" "s3://$BUCKET/index.html" --profile "$PROFILE" \
    --content-type "text/html; charset=utf-8" \
    --cache-control "no-cache" \
    ${DRYRUN[@]+"${DRYRUN[@]}"}

echo "Done: https://$BUCKET"
