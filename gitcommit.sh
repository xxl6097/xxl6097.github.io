#!/bin/bash
function todir() {
  pwd
}

function pull() {
  todir
  echo "gitpull....."
  git pull
}

function forcepull() {
  todir
  echo "git fetch --all && git reset --hard origin/master && git pull"
  git fetch --all && git reset --hard origin/master && git pull
}


# shellcheck disable=SC2120
function gitpush() {
  echo "gitpush....."
  commit=""
  if [ ! -n "$1" ]; then
    commit="$(date '+%Y-%m-%d %H:%M:%S') by ${USER}"
  else
    commit="$1 by ${USER}"
  fi

  echo $commit
  git add .
  git commit -m "$commit"
  #  git push -u origin main
  git push
}

function bootstrap() {
    case $1 in
    pull)
      pull
      ;;
    -f)
      forcepull
      ;;
    *)
      gitpush $1
      ;;
    esac
}


bootstrap $1

