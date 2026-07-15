#!/bin/bash
cd "$(dirname "$0")"
command -v node >/dev/null 2>&1 || { echo "Node.js 18+ gerekli."; read -n 1; exit 1; }
[ -d node_modules ] || npm install
npm start
