#!/bin/sh

if [ -z "$1" ]; then
  echo "Usage: repro.sh <repro_path>"
  exit 1
fi

echo "Serving repro from: ./repros/$1"
vite serve "./repros/$1" --force
