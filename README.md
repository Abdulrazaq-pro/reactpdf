# PDF Annotator with highlighting function

## Description
A modern, interactive PDF annotation tool built with React that allows users to highlight, comment, and manage annotations within PDF documents. The application provides a smooth, intuitive interface for document review and collaboration.


### PDF Management
- Upload and view PDF documents
- Smooth zooming and navigation
- Persistent document state
- Multi-page support

### Annotation Tools
- **Text Highlighting**
  - Multiple highlight colors (Yellow, Green, Pink, Purple, Orange)
  - Toggle highlighting mode
  - Add comments to highlighted sections
  - Real-time annotation saving
  - Easy deletion and modification

### User Interface
- Responsive design with mobile support
- Collapsible sidebar for annotations
- Clean, modern interface
- Smooth animations and transitions
- Dark mode support

## Requirements
- Node.js (v16.0.0 or higher recommended)
- npm, yarn, or pnpm package manager
- Modern web browser with PDF.js support

## Installation

1. Clone the repository:
```bash
git clone https://github.com/Abdulrazaq-pro/reactpdf.git
cd reactpdf
```

2. Install dependencies:
```bash
npm install
# or
yarn install
# or
pnpm install
```

3. Start the development server:
```bash
npm start
# or
yarn start
# or
pnpm start
```

4. Open your browser and navigate to `http://localhost3000` (or the port shown in your terminal)

## Usage Guide

### Getting Started
1. Launch the application
2. Click the "Upload PDF" button to select a PDF file
3. Wait for the document to load

### Using the Highlight Tool
1. Click the highlight icon in the toolbar to activate highlighting mode
2. Select your preferred highlight color from the color palette
3. Click and drag across text to create highlights
4. Add optional comments to your highlights in the sidebar
5. Click the highlight icon again to exit highlighting mode

### Managing Annotations
- View all highlights in the sidebar
- Click on a highlight in the sidebar to locate it in the document
- Add or edit comments for any highlight
- Delete highlights using the trash icon
- All annotations are automatically saved to local storage

## Technical Stack
- React
- react-pdf
- GSAP for animations
- Tailwind CSS for styling
- Local Storage for persistence

## Browser Support
- Chrome (recommended)
- Firefox
- Safari
- Edge

## Contributing
Contributions are welcome! Please feel free to submit a Pull Request.

## License
This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments
- PDF.js for PDF rendering
- react-pdf for React integration
- Lucide for icons
- GSAP for animations

## Support
If you encounter any issues or have questions, please open an issue on GitHub.