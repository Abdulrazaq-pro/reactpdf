import React, { useState, useEffect, useRef } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import "react-pdf/dist/Page/TextLayer.css";
import "react-pdf/dist/Page/AnnotationLayer.css";
import { gsap } from "gsap";
import {
  FileUp,
  ZoomIn,
  ZoomOut,
  X,
  Menu,
  MessageSquare,
  PaintBucket,
  Trash2,
  Edit2,
  AlertTriangle
} from "lucide-react";

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  "pdfjs-dist/build/pdf.worker.min.js",
  import.meta.url
).toString();

export default function PdfAnnotator() {
  // Core states
  const [file, setFile] = useState(null);
  const [numPages, setNumPages] = useState(null);
  const [scale, setScale] = useState(1.0);
  const [documentId, setDocumentId] = useState(null);

  // UI states
  const [isSidebarOpen, setSidebarOpen] = useState(true);
  const [isSmallScreen, setIsSmallScreen] = useState(false);
  const [activeHighlight, setActiveHighlight] = useState(null);

  // Annotation states
  const [highlights, setHighlights] = useState([]);
  const [selectedColor, setSelectedColor] = useState("#FFD93D");
  const [isHighlighting, setIsHighlighting] = useState(false);
  

  const containerRef = useRef(null);
  const fileInputRef = useRef(null);

  const highlightColors = [
    { name: "Yellow", value: "#FFD93D" },
    { name: "Green", value: "#4ECDC4" },
    { name: "Pink", value: "#FF8B94" },
    { name: "Purple", value: "#9B89B3" },
    { name: "Orange", value: "#FF6B6B" },
  ];

  // Responsive handler
  useEffect(() => {
    const handleResize = () => {
      const smallScreen = window.innerWidth < 768;
      setIsSmallScreen(smallScreen);
      if (smallScreen) {
        setSidebarOpen(false);
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Document handling
  const generateDocumentId = async (file) => {
    const buffer = await file.arrayBuffer();
    const hashBuffer = await crypto.subtle.digest("SHA-256", buffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
  };

  const handleFileUpload = async (e) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile || selectedFile.type !== "application/pdf") {
      alert("Please upload a valid PDF file.");
      return;
    }

    try {
      const newDocumentId = await generateDocumentId(selectedFile);
      setDocumentId(newDocumentId);
      setFile(selectedFile);
      loadStoredAnnotations(newDocumentId);
    } catch (error) {
      console.error("Error processing file:", error);
      alert("Error processing PDF. Please try again.");
    }
  };

  // Annotation management
  const loadStoredAnnotations = (docId) => {
    try {
      const stored = localStorage.getItem(`pdf-annotations-${docId}`);
      if (stored) {
        const loadedHighlights = JSON.parse(stored);
        setHighlights(loadedHighlights);
      } else {
        setHighlights([]);
      }
    } catch (error) {
      console.error("Error loading annotations:", error);
      alert("Error loading saved annotations.");
    }
  };

  const saveAnnotations = () => {
    if (!documentId) return;
    try {
      localStorage.setItem(
        `pdf-annotations-${documentId}`,
        JSON.stringify(highlights)
      );
    } catch (error) {
      console.error("Error saving annotations:", error);
      alert("Error saving annotations.");
    }
  };

  useEffect(() => {
    saveAnnotations();
  }, [highlights]);

  const handleTextSelection = () => {
    if (!isHighlighting) return;

    const selection = window.getSelection();
    const selectedText = selection.toString().trim();

    if (selectedText) {
      const range = selection.getRangeAt(0);
      const rect = range.getBoundingClientRect();
      const containerRect = containerRef.current.getBoundingClientRect();

      const pageElement =
        range.startContainer.parentElement.closest(".react-pdf__Page");
      if (!pageElement) return;

      const pageNumber = parseInt(pageElement.getAttribute("data-page-number"));
      const scrollTop = containerRef.current.scrollTop;

      const newHighlight = {
        id: Date.now(),
        text: selectedText,
        color: selectedColor,
        pageNumber,
        comment: "",
        position: {
          top: rect.top + scrollTop - containerRect.top,
          left: rect.left - containerRect.left,
          width: rect.width,
          height: rect.height,
        },
      };

      setHighlights((prev) => [...prev, newHighlight]);
      setActiveHighlight(newHighlight);
      selection.removeAllRanges();

      gsap.from(`[data-highlight="${newHighlight.id}"]`, {
        opacity: 0,
        scale: 0.95,
        duration: 0.3,
        ease: "power2.out",
      });
    }
  };

  const updateHighlightComment = (id, comment) => {
    setHighlights((prev) =>
      prev.map((h) => (h.id === id ? { ...h, comment } : h))
    );
  };

  const deleteHighlight = (id) => {
    gsap.to(`[data-highlight="${id}"]`, {
      opacity: 0,
      scale: 0.95,
      duration: 0.3,
      ease: "power2.out",
      onComplete: () => {
        setHighlights((prev) => prev.filter((h) => h.id !== id));
        if (activeHighlight?.id === id) {
          setActiveHighlight(null);
        }
      },
    });
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Navigation Bar */}
      <nav className="p-4 bg-white shadow-md">
        <div className="container flex items-center justify-between mx-auto">
          <h1 className="text-xl font-bold">PDF Annotator</h1>
          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-2 px-4 py-2 text-white transition-colors bg-blue-500 rounded-lg hover:bg-blue-600"
          >
            <FileUp className="w-5 h-5" />
            <span className="hidden sm:inline">Upload PDF</span>
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="application/pdf"
            onChange={handleFileUpload}
            className="hidden"
          />
        </div>
      </nav>

      {/* Main Content */}
      <div className="container p-4 mx-auto">
        <div className="flex flex-col gap-4 md:flex-row">
          {/* PDF Viewer */}
          <div className="flex-1">
            {file ? (
              <div className="p-4 bg-white rounded-lg shadow-lg">
                {/* Toolbar */}
                <div className="flex flex-wrap items-center gap-3 mb-4">
                  <div className="flex gap-2">
                    {highlightColors.map((color) => (
                      <button
                        key={color.value}
                        className="w-8 h-8 transition-transform duration-200 rounded-full hover:scale-110"
                        style={{
                          backgroundColor: color.value,
                          transform:
                            selectedColor === color.value
                              ? "scale(1.1)"
                              : "scale(1)",
                          boxShadow:
                            selectedColor === color.value
                              ? `0 0 0 2px white, 0 0 0 4px ${color.value}`
                              : "none",
                        }}
                        onClick={() => setSelectedColor(color.value)}
                      />
                    ))}
                  </div>

                  <button
                    onClick={() => setIsHighlighting(!isHighlighting)}
                    className={`px-4 py-2 rounded-lg transition-all duration-300 flex items-center gap-2
                      ${
                        isHighlighting
                          ? "bg-green-500 text-white"
                          : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                      }`}
                  >
                    <PaintBucket className="w-4 h-4" />
                    <span className="hidden sm:inline">
                      {isHighlighting ? "Highlighting" : "Highlight"}
                    </span>
                  </button>

                  <div className="flex items-center gap-2 ml-auto">
                    <button
                      onClick={() =>
                        setScale((prev) => Math.max(0.5, prev - 0.1))
                      }
                      className="p-2 transition-colors rounded-lg hover:bg-gray-100"
                    >
                      <ZoomOut className="w-5 h-5" />
                    </button>
                    <span className="text-sm text-gray-600 min-w-[3rem] text-center">
                      {Math.round(scale * 100)}%
                    </span>
                    <button
                      onClick={() =>
                        setScale((prev) => Math.min(2, prev + 0.1))
                      }
                      className="p-2 transition-colors rounded-lg hover:bg-gray-100"
                    >
                      <ZoomIn className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                {/* PDF Document */}
                <div
                  ref={containerRef}
                  className="relative overflow-auto max-h-[calc(100vh-12rem)]"
                  onMouseUp={handleTextSelection}
                >
                  <Document
                    file={file}
                    onLoadSuccess={({ numPages }) => setNumPages(numPages)}
                    className="flex flex-col items-center"
                  >
                    {Array.from(new Array(numPages), (_, index) => (
                      <div key={index} className="relative mb-4">
                        <Page
                          pageNumber={index + 1}
                          scale={scale}
                          className="shadow-xl"
                          renderTextLayer={true}
                          renderAnnotationLayer={true}
                        />
                        {/* Highlight Overlays */}
                        {/* Highlight Overlays */}
                        {highlights
                          .filter((h) => h.pageNumber === index + 1)
                          .map((highlight) => (
                            <div
                              key={highlight.id}
                              data-highlight={highlight.id}
                              className="absolute transition-opacity duration-200 cursor-pointer hover:opacity-80"
                              style={{
                                top: highlight.position.top,
                                left: highlight.position.left,
                                width: highlight.position.width,
                                height: highlight.position.height,
                              }}
                              onClick={() => setActiveHighlight(highlight)}
                            />
                          ))}
                      </div>
                    ))}
                  </Document>
                </div>
              </div>
            ) : (
              <div className="p-8 text-center bg-white rounded-lg shadow-lg">
                <AlertTriangle className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                <h2 className="mb-2 text-xl font-semibold">No PDF Selected</h2>
                <p className="mb-4 text-gray-600">
                  Upload a PDF document to start annotating
                </p>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="px-6 py-3 text-white transition-colors bg-blue-500 rounded-lg hover:bg-blue-600"
                >
                  Choose PDF
                </button>
              </div>
            )}
          </div>

          {/* Sidebar Toggle for Mobile */}
          {file && isSmallScreen && (
            <button
              onClick={() => setSidebarOpen(!isSidebarOpen)}
              className="fixed flex items-center justify-center w-12 h-12 text-white transition-colors bg-blue-500 rounded-full shadow-lg bottom-4 right-4 hover:bg-blue-600"
            >
              {isSidebarOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          )}

          {/* Annotations Sidebar */}
          {file && (
            <div
              className={`
                fixed md:relative top-0 right-0 h-full md:h-auto w-full md:w-96
                transform transition-transform duration-300 ease-in-out
                ${
                  isSidebarOpen
                    ? "translate-x-0"
                    : "translate-x-full md:translate-x-0"
                }
                bg-white shadow-lg md:shadow-none z-50 md:z-0 overflow-y-auto
              `}
            >
              <div className="p-4">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold">
                    Highlights & Comments
                  </h2>
                  {isSmallScreen && (
                    <button
                      onClick={() => setSidebarOpen(false)}
                      className="p-2 rounded-full bg-gray-50 hover:bg-gray-200"
                    >
                      <X className="w-5 h-5 text-gray-600" />
                    </button>
                  )}
                </div>

                <div className="space-y-4">
                  {highlights.length === 0 ? (
                    <p className="text-center text-gray-500">
                      No highlights yet. Select text to highlight it.
                    </p>
                  ) : (
                    highlights.map((highlight) => (
                      <div
                        key={highlight.id}
                        className={`p-4 rounded-lg  border-2 transition-all duration-200 ${
                          activeHighlight?.id === highlight.id
                            ? "border-blue-500 bg-blue-50"
                            : "border-transparent bg-gray-100"
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div
                            className="flex-shrink-0 w-4 h-4 mt-1 rounded-full"
                            // style={{ backgroundColor: highlight.color }}
                          />
                          <div className="flex-1">
                            <p className="mb-2 text-sm ">"{highlight.text}"</p>
                            <textarea
                              value={highlight.comment}
                              onChange={(e) =>
                                updateHighlightComment(
                                  highlight.id,
                                  e.target.value
                                )
                              }
                              className="w-full h-20 p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                              placeholder="Add a comment..."
                            />
                          </div>
                          <button
                            onClick={() => deleteHighlight(highlight.id)}
                            className="p-2 text-white bg-red-500 rounded-full hover:bg-red-600"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}







                              