#!/bin/bash
# ==========================================================================
# Setup Azure DNS for xyzicon.com → GitHub Pages
#
# Prerequisites:
#   - az cli installed and logged in
#   - Domain xyzicon.com purchased in subscription f7759234-c85d-4ebf-8c87-98a68b327eb7
#
# This script:
#   1. Creates a DNS zone for xyzicon.com
#   2. Adds A records pointing to GitHub Pages IPs
#   3. Adds CNAME for www → GitHub Pages
#   4. Adds TXT record for domain verification
# ==========================================================================

set -euo pipefail

SUBSCRIPTION="f7759234-c85d-4ebf-8c87-98a68b327eb7"
DOMAIN="xyzicon.com"
RESOURCE_GROUP="xyzicon-dns-rg"
GITHUB_PAGES_USER="mjtpena"  # GitHub username for Pages

echo "=== Setting subscription ==="
az account set --subscription "$SUBSCRIPTION"

echo "=== Creating resource group (if not exists) ==="
az group create \
    --name "$RESOURCE_GROUP" \
    --location "australiaeast" \
    --output none 2>/dev/null || true

echo "=== Creating DNS zone ==="
az network dns zone create \
    --resource-group "$RESOURCE_GROUP" \
    --name "$DOMAIN" \
    --output table 2>/dev/null || echo "DNS zone may already exist, continuing..."

# GitHub Pages IP addresses (as of 2024+)
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
echo "============================================"
echo "DONE! Next steps:"
echo ""
echo "1. Update the domain registrar's nameservers to the ones above"
echo "   (If purchased via Azure App Service Domains, this should be automatic)"
echo ""
echo "2. In your GitHub repo Settings → Pages → Custom domain,"
echo "   enter: $DOMAIN"
echo ""
echo "3. Check 'Enforce HTTPS' once the certificate is provisioned"
echo ""
echo "4. DNS propagation may take up to 48 hours"
echo "============================================"
