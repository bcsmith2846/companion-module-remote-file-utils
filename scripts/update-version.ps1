#!/usr/bin/env sh
echo --% >/dev/null;: '    | out-null
<#'

sed -i "s/^\(.*version.:\).*$/\1 \"$1\",/" ./package.json 
sed -i "s/^\(.*version.:\).*$/\1 \"$1\",/" ./companion/manifest.json


exit #>


$version = $args[0]

sed -i "s/^\(.*version.:\).*$/\1 `"$version`",/" ./package.json 
sed -i "s/^\(.*version.:\).*$/\1 `"$version`",/" ./companion/manifest.json