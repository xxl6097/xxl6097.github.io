#!/bin/bash
function todir() {
  timestamp=$(date '+%Y-%m-%d %H:%M:%S')
  echo "$timestamp"
  pwd
}

function pull() {
  todir
  git pull
}

function forcepull() {
  todir
  git fetch --all && git reset --hard origin/master && git pull
}

function push() {
  todir
  arg1=$1
  arg2=$2
  echo "1---->$1 $2"
  if [ ! -n "$1" ]; then
    arg1=$(date '+%Y-%m-%d %H:%M:%S')
  else
    arg1=$1
  fi
  echo "2---->$1 $2"

  if [ ! -n "$2" ]; then
    arg2="n"
    echo "2.1---->$1 $arg2"
  else
    echo "2.2---->$1 $arg2"
    arg2=$1
  fi

  echo "3---->$1 $arg2"
  if [ "${arg2}" = "f" ]; then
    forcepull
  fi
  echo "3.1---->$commit"
  commit="$arg1"
  if [ "${arg1}" = "" ]; then
    commit=$(date '+%Y-%m-%d %H:%M:%S')
  else
    commit="$arg1"
  fi
  echo "4---->$commit"
  git add .
  git commit -m "$commit"
#  git push -u origin main
  git push
}

push $1 $2
