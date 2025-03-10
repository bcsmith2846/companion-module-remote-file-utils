#!/usr/bin/env sh
echo --% >/dev/null;: '              | out-null
<#'

version=$(sed -rn 's/^.*version.:\s*"(.*)".*$/\1/p' ./package.json)
IFS='.' read -r major minor patch <<< "$version"
patch=$((patch + 1))
new_version="$major.$minor.$patch"
echo $new_version

exit #>


#powershell part
$version = $(sed -rn 's/^.*version.:\s*"(.*)".*$/\1/p' ./package.json)
$version = $version -split '\.'
$major = $version[0]
$minor = $version[1]
$patch = $version[2]
#add one after converting to int
$patch = [int]$patch + 1
$new_version = "$major.$minor.$patch"
echo $new_version