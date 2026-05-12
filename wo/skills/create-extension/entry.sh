#!/usr/bin/env bash
set -euo pipefail

# Extension Creation Entry Script
# Usage: create-extension [options]

TEMPLATES_DIR="${TEMPLATES_DIR:-~/.pi/templates}"

# Initialize variables
TEMPLATE=""
GENERATE=false
PURPOSE=""
DOMAIN=""
TOOLS=""
APIS=""
ARGS=""
INTERACTIVE=true

# Parse arguments
while [[ $# -gt 0 ]]; do
  case $1 in
    --template)
      TEMPLATE="$2"
      shift 2
      ;;
    --generate)
      GENERATE=true
      shift
      ;;
    --purpose)
      PURPOSE="$2"
      shift 2
      ;;
    --domain)
      DOMAIN="$2"
      shift 2
      ;;
    --tools)
      TOOLS="$2"
      shift 2
      ;;
    --apis)
      APIs="$2"
      shift 2
      ;;
    --)
      ARGS="$*"
      shift
      ;;
    *)
      ARGS="$1 $ARGS"
      shift
      ;;
  esac
done

# Interactive mode - ask questions
if [[ "$INTERACTIVE" == "true" ]]; then
  echo "🚀 Extension Creation Assistant"
  echo "=================================="
  echo ""
  
  # Ask about purpose
  if [[ -z "$PURPOSE" ]]; then
    echo "❓ What capability or functionality do you want to add?"
    read -r PURPOSE
  fi
  
  # Ask about domain
  if [[ -z "$DOMAIN" ]]; then
    echo "❓ What domain should this operate in?"
    echo "   Options: web-access, image-access, pdf, git, github, finance, seo, etc."
    read -r DOMAIN
  fi
  
  # Ask about tools
  if [[ -z "$TOOLS" ]]; then
    echo "❓ What tools should it use?"
    echo "   Options: npm, docker, git, bash, system-access (or no dependencies)"
    read -r TOOLS
  fi
  
  # Ask about APIs
  if [[ -z "$APIS" ]]; then
    echo "❓ Any external services to integrate with?"
    read -r APIs
  fi
else
  echo "⚙️  Non-interactive mode"
  echo "   Purpose: $PURPOSE"
  echo "   Domain: $DOMAIN"
  echo "   Tools: $TOOLS"
  echo "   APIs: $APIS"
fi

# Generate extension structure
echo ""
echo "📦 Generating extension structure..."

# Base template directory
EXT_DIR="${TEMPLATES_DIR}/create-extension"


fi

# Continue with generation
if [[ "$GENERATE" == "true" ]] || [[ "$PURPOSE" != "" ]]; then
  # Generate extension
  generate_extension "$TEMPLATE" "$PURPOSE" "$DOMAIN" "$TOOLS" "$APIS"
else
  # No generation requested
  if [[ "$TEMPLATES_DIR" != "" ]]; then
    echo "Available templates in: $TEMPLATES_DIR"
  fi
  
  echo "Use --help or --generate to start creation."
fi

echo "🚀 Extension creation process initiated."
echo ""
echo "Next steps:"
echo "  1. Review generated files in your extension directory"
echo "  2. Run npm install to install dependencies"
echo "  3. Run npm start to test the extension"
echo "  4. Submit for official registry (optional)"
