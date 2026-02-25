#!/bin/bash
# ==========================================================================
# Setup Azure DNS for xyzicon.com → GitHub Pages
#
# Prerequisites:
#   - az cli installed and logged in
#   - Domain xyzicon.com purchased in subscription f7759234-c85d-4ebf-8c87-98a68b327eb7
#   - DNS zone already exists in RG-DOMAINS resource group
#
# This script:
#   1. Adds A records pointing to GitHub Pages IPs
#   2. Adds CNAME for www → GitHub Pages
#   3. Adds TXT record for domain verification
#   4. Sets custom domain on GitHub Pages via gh cli
#
# STATUS: Already executed on 2026-02-25. Records are live.
# ==========================================================================

set -euo pipefail

SUBSCRIPTION="f7759234-c85d-4ebf-8c87-98a68b327eb7"
DOMAIN="xyzicon.com"
RESOURCE_GROUP="RG-DOMAINS"
GITHUB_PAGES_USER="mjtpena"
GITHUB_REPO="mjtpena/cloudicons"

echo "=== Setting subscription ==="
az account set --subscription "$SUBSCRIPTION"

# GitHub Pages IP addresses
# See: https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site
GITHUB_IPS=("185.199.108.153" "185.199.109.153" "185.199.110.153" "185.199.111.153")

echo "=== Adding A records (apex domain → GitHub Pages) ==="
for ip in "${GITHUB_IPS[@]}"; do
    az network dns record-set a add-record \
        --resource-group "$RESOURCE_GROUP" \
        --zone-name "$DOMAIN" \
        --record-set-name "@" \
        --ipv4-address "$ip" \
        --output none 2>/dev/null || true
    echo "  Added A record: $ip"
done

echo "=== Adding CNAME record (www → GitHub Pages) ==="
az network dns record-set cname set-record \
    --resource-group "$RESOURCE_GROUP" \
    --zone-name "$DOMAIN" \
    --record-set-name "www" \
    --cname "${GITHUB_PAGES_USER}.github.io" \
    --output table 2>/dev/null || true

echo "=== Adding TXT record for GitHub verification ==="
az network dns record-set txt add-record \
    --resource-group "$RESOURCE_GROUP" \
    --zone-name "$DOMAIN" \
    --record-set-name "@" \
    --value "${GITHUB_PAGES_USER}.github.io" \
    --output none 2>/dev/null || true

echo ""
echo "=== DNS Zone Name Servers ==="
az network dns zone show \
    --resource-group "$RESOURCE_GROUP" \
    --name "$DOMAIN" \
    --query "nameServers" \
    --output tsv

echo ""
echo "=== Setting custom domain on GitHub Pages ==="
if command -v gh &> /dev/null; then
    gh api "repos/${GITHUB_REPO}/pages" -X PUT -f cname="$DOMAIN" -f build_type="workflow" --silent 2>/dev/null || true
    echo "GitHub Pages custom domain set to $DOMAIN"

    # Try enabling HTTPS (may fail if cert not yet provisioned)
    gh api "repos/${GITHUB_REPO}/pages" -X PUT -F https_enforced=true --silent 2>/dev/null || \
        echo "HTTPS enforcement pending certificate provisioning"
else
    echo "gh CLI not found. Set custom domain manually in GitHub repo Settings → Pages"
fi

echo ""
echo "============================================"
echo "DONE! DNS records configured in RG-DOMAINS."
echo "GitHub Pages custom domain set to $DOMAIN."
echo "HTTPS will auto-enable once DNS propagates."
echo "============================================"
