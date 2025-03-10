#!/usr/bin/env sh
echo --% >/dev/null;: '             | out-null
<#'

version=$(sed -rn 's/^.*version.:\s*"(.*)".*$/\1/p' ./package.json)
IFS='.' read -r major minor patch <<< "$version"
major=$((major + 1))
new_version="$major.0.0"
echo $new_version

exit #>


#powershell part
$version = $(sed -rn 's/^.*version.:\s*"(.*)".*$/\1/p' ./package.json)
$version = $version -split '\.'
$major = $version[0]
$minor = $version[1]
$patch = $version[2]
#add one after converting to int
$major = [int]$major + 1
$new_version = "$major.0.0"
echo $new_version