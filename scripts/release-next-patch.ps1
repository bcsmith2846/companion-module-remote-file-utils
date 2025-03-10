#!/usr/bin/env sh
echo --% >/dev/null;: '            | out-null
<#'

NEXT_VERSION=$(./scripts/next-patch.ps1)
./scripts/update-version.ps1  ${NEXT_VERSION}
echo "Updated version to ${NEXT_VERSION}"

git add ./package.json ./companion/manifest.json
git commit -m "Update version to ${NEXT_VERSION}"
git push
echo "Committed and pushed version update"

git tag -s -m "v${NEXT_VERSION} release" "v${NEXT_VERSION}"
echo "Added tag v${NEXT_VERSION}"

git push origin tag "v${NEXT_VERSION}"
echo "Pushed tag v${NEXT_VERSION} to remote"

exit #>

$NEXT_VERSION = $(./scripts/next-patch.ps1)
./scripts/update-version.ps1  ${NEXT_VERSION}
echo "Updated version to ${NEXT_VERSION}"

git add ./package.json ./companion/manifest.json
git commit -m "Update version to ${NEXT_VERSION}"
git push
echo "Committed and pushed version update"

git tag -s -m "v${NEXT_VERSION} release" "v${NEXT_VERSION}"
echo "Added tag v${NEXT_VERSION}"

git push origin tag "v${NEXT_VERSION}"
echo "Pushed tag v${NEXT_VERSION} to remote"