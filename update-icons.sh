#!/bin/bash

echo "Starting icon update process..."
cd "$(dirname "$0")"

# Create temp directory
TEMP_DIR=$(mktemp -d)
trap "rm -rf $TEMP_DIR" EXIT

# AWS Icons
echo "Checking AWS icons..."
AWS_URL="https://d1.awsstatic.com/onedam/marketing-channels/website/aws/en_US/architecture/approved/architecture-icons/Asset-Package_07312025.49d3aab7f9e6131e51ade8f7c6c8b961ee7d3bb1.zip"
AWS_ZIP="$TEMP_DIR/aws-icons.zip"
curl -L -o "$AWS_ZIP" "$AWS_URL" || echo "Failed to download AWS icons"

if [ -f "$AWS_ZIP" ]; then
    echo "Downloaded AWS icons, extracting..."
    rm -rf wwwroot/icons/aws/*
    unzip -q "$AWS_ZIP" -d wwwroot/icons/aws/
    echo "AWS icons updated"
else
    echo "Skipping AWS icons update"
fi

# Azure Icons
echo "Checking Azure icons..."
AZURE_URL="https://arch-center.azureedge.net/icons/Azure_Public_Service_Icons_V18.zip"
AZURE_ZIP="$TEMP_DIR/azure-icons.zip"
curl -L -o "$AZURE_ZIP" "$AZURE_URL" 2>/dev/null || echo "Failed to download Azure icons"

if [ -f "$AZURE_ZIP" ]; then
    echo "Downloaded Azure icons, extracting..."
    rm -rf wwwroot/icons/azure/*
    unzip -q "$AZURE_ZIP" -d wwwroot/icons/azure/
    echo "Azure icons updated"
else
    echo "Skipping Azure icons update"
fi

# Microsoft 365 Icons
echo "Checking Microsoft 365 icons..."
M365_URL="https://download.microsoft.com/download/2/F/3/2F346655-1F7E-4F5E-BE78-82DA3D507F3A/2024-microsoft-365-content-icons.zip"
M365_ZIP="$TEMP_DIR/m365-icons.zip"
curl -L -o "$M365_ZIP" "$M365_URL" || echo "Failed to download M365 icons"

if [ -f "$M365_ZIP" ]; then
    echo "Downloaded M365 icons, extracting..."
    rm -rf wwwroot/icons/microsoft365/*
    unzip -q "$M365_ZIP" -d wwwroot/icons/microsoft365/
    echo "M365 icons updated"
else
    echo "Skipping M365 icons update"
fi

# Power Platform Icons
echo "Checking Power Platform icons..."
PP_URL="https://download.microsoft.com/download/498606aa-6d27-4f13-aa5c-1401078c153b/Power-Platform-icons-scalable.zip"
PP_ZIP="$TEMP_DIR/powerplatform-icons.zip"
curl -L -o "$PP_ZIP" "$PP_URL" || echo "Failed to download Power Platform icons"

if [ -f "$PP_ZIP" ]; then
    echo "Downloaded Power Platform icons, extracting..."
    rm -rf wwwroot/icons/powerplatform/*
    unzip -q "$PP_ZIP" -d wwwroot/icons/powerplatform/
    echo "Power Platform icons updated"
else
    echo "Skipping Power Platform icons update"
fi

# Dynamics 365 Icons
echo "Checking Dynamics 365 icons..."
D365_URL="https://download.microsoft.com/download/498606aa-6d27-4f13-aa5c-1401078c153b/Dynamics-365-icons-scalable.zip"
D365_ZIP="$TEMP_DIR/dynamics365-icons.zip"
curl -L -o "$D365_ZIP" "$D365_URL" || echo "Failed to download Dynamics 365 icons"

if [ -f "$D365_ZIP" ]; then
    echo "Downloaded Dynamics 365 icons, extracting..."
    rm -rf wwwroot/icons/dynamics365/*
    unzip -q "$D365_ZIP" -d wwwroot/icons/dynamics365/
    echo "Dynamics 365 icons updated"
else
    echo "Skipping Dynamics 365 icons update"
fi

# Microsoft Fabric Icons
echo "Checking Microsoft Fabric icons..."
FABRIC_URL="https://github.com/microsoft/fabric-samples/raw/main/docs-samples/Icons.zip"
FABRIC_ZIP="$TEMP_DIR/fabric-icons.zip"
curl -sL -o "$FABRIC_ZIP" "$FABRIC_URL" || echo "Failed to download Fabric icons"

if [ -f "$FABRIC_ZIP" ]; then
    echo "Downloaded Fabric icons, extracting..."
    unzip -q "$FABRIC_ZIP" -d "$TEMP_DIR/fabric-temp/"
    if [ -d "$TEMP_DIR/fabric-temp/icons/package/dist/svg" ]; then
        rm -rf wwwroot/icons/fabric/svg/*
        cp -r "$TEMP_DIR/fabric-temp/icons/package/dist/svg/"* wwwroot/icons/fabric/svg/
        echo "Fabric icons updated"
    else
        echo "Could not find Fabric SVG icons in downloaded package"
    fi
else
    echo "Skipping Fabric icons update"
fi

echo "Icon update process completed!"

# Generate metadata files
echo "Generating icon metadata..."
python3 generate-metadata.py

echo "Icon update and metadata generation completed!"
echo "Please review the changes before committing."
