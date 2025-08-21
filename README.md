# Official Cloud Icons

CloudIcons is a Blazor WebAssembly application that lets you download official icons for Azure, AWS, and GCP in SVG and PNG formats. The app is now hosted as a static web application on GitHub Pages.

🌐 **Live Demo**: [https://mjtpena.github.io/cloudicons/](https://mjtpena.github.io/cloudicons/)

## Features

- Download official icons for Azure, AWS, and GCP
- Choose between SVG and PNG formats
- Browse icons easily with a user-friendly interface
- Search and filter icons by name
- Copy images to clipboard for quick use
- Fast loading with pre-generated metadata

## Icon Sources

The icons are sourced from official provider repositories:

- [Azure Architecture Icons](https://learn.microsoft.com/en-us/azure/architecture/icons/)
- [Fabric Icons](https://learn.microsoft.com/en-us/fabric/get-started/icons)
- [Microsoft 365 Architecture Icons and Templates](https://learn.microsoft.com/en-us/microsoft-365/solutions/architecture-icons-templates?view=o365-worldwide)
- [Dynamics 365 Icons](https://learn.microsoft.com/en-us/dynamics365/get-started/icons)
- [Power Platform Icons](https://learn.microsoft.com/en-us/power-platform/guidance/icons)
- [AWS Architecture Icons](https://aws.amazon.com/architecture/icons/)
- [GCP Architecture Icons](https://cloud.google.com/icons)

## Getting Started

### Prerequisites

- .NET 8.0 or later
- Visual Studio 2019 or later (or VS Code)

### Installation

1. Clone the repo

```bash
git clone https://github.com/mjtpena/cloudicons.git
```

2. Navigate to the project directory
```bash
cd cloudicons
```

3. Restore dependencies
```bash
dotnet restore
```

4. Run the project
```bash
dotnet run
```

## Building for Production

### GitHub Pages Deployment

This project is configured for automatic deployment to GitHub Pages. The deployment happens automatically when changes are pushed to the `main` branch via GitHub Actions.

#### Manual Build for GitHub Pages

To build the static files for GitHub Pages deployment manually:

```bash
dotnet publish -c Release -o ./dist
```

The output will be in `./dist/wwwroot/cloudicons/` with the correct base path configured for GitHub Pages subpath deployment.

#### Local Development

For local development, use:

```bash
dotnet run
```

This will start the development server at `https://localhost:5001` (or similar).

## Usage

1. Navigate to the live demo or run locally
2. Select an icon provider from the navigation menu (Azure, AWS, GCP, etc.)
3. Use the search box to find specific icons
4. Click "Download SVG" to download the vector format
5. Check "Download as PNG" and click the link to download as PNG
6. Right-click on any icon to copy it to clipboard

## Technology

- **Frontend**: Blazor WebAssembly (.NET 8)
- **Hosting**: GitHub Pages (Static)
- **Icons**: 7,818 official cloud service icons
- **Build**: GitHub Actions for CI/CD

## Deployment

### GitHub Pages Deployment

The application is automatically deployed to GitHub Pages using GitHub Actions:

1. **Automatic Deployment**: Every push to the `main` branch triggers the deployment workflow
2. **Workflow**: The `.github/workflows/deploy.yml` workflow handles:
   - Building the .NET 8 Blazor WebAssembly application
   - Configuring the base path for GitHub Pages subpath (`/cloudicons/`)
   - Adding the `.nojekyll` file for proper asset serving
   - Deploying to GitHub Pages

### Manual Deployment Steps

If you need to deploy manually or troubleshoot:

1. Ensure the repository has GitHub Pages enabled in Settings → Pages
2. Set the source to "GitHub Actions"
3. The workflow will automatically handle deployment on push to `main`

### Local Testing of Production Build

To test the production build locally:

```bash
dotnet publish -c Release -o ./dist
# Serve the ./dist/wwwroot/cloudicons/ directory with a static file server
```

Note: The production build includes the `/cloudicons/` base path configuration for GitHub Pages.

## Contributing

Pull requests are welcome. Please open an issue first to discuss major changes.

## License

This project is licensed under the MIT License. See `LICENSE` for more details.

## Disclaimer

I don't own these icons - they belong to their respective cloud providers. This application simply redistributes them for your convenience in a user-friendly interface.

## Contact

Michael John Peña - michael.pena@playtimesolutions.com.au
Project Link: https://github.com/mjtpena/cloudicons
