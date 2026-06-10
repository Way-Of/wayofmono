#!/bin/bash
# Skill     

QUERY="$1"
LIMIT="${2:-10}"

if [ -z "$QUERY" ]; then
    echo "  : search.sh <   > [  ]"
    exit 1
fi

echo "🔍   : $QUERY"
echo "================================"

clawhub search "$QUERY" --limit "$LIMIT"
