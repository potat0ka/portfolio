#!/bin/sh

git filter-branch --env-filter '
export GIT_COMMITTER_NAME="Bigendra Shrestha"
export GIT_COMMITTER_EMAIL="Bige.stha@gmail.com"
export GIT_AUTHOR_NAME="Bigendra Shrestha"
export GIT_AUTHOR_EMAIL="Bige.stha@gmail.com"
' --tag-name-filter cat -- --branches --tags
