import React, { useState, useRef, useEffect } from 'react';
import './MainPage.css'; // Import the CSS file here

const EZNotes = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [fontSize, setFontSize] = useState(11);
  const [showSummary, setShowSummary] = useState(false);
  const [showDefine, setShowDefine] = useState(false);
  const [showKeywords, setShowKeywords] = useState(false);
  const [showKeywordsNoteSlide, setShowKeywordsNoteSlide] = useState(false);
  const [showOptions, setShowOptions] = useState(false);
  const [buttonLabel, setButtonLabel] = useState('Options');
  const [definitions, setDefinitions] = useState(['']);
  const [keywords, setKeywords] = useState(['']);
  const [notesSlideContent, setNotesSlideContent] = useState('');
  const [wordCount, setWordCount] = useState(0);
  const [content, setContent] = useState('');
  const textAreaRef = useRef(null);
  const summaryPopupRef = useRef(null);
  const definePopupRef = useRef(null);
  const keywordsPopupRef = useRef(null);
  const keywordsNoteSlidePopupRef = useRef(null);

  const handleWordCount = (text) => {
    const words = text.trim().split(/\s+/).filter((word) => word.length > 0);
    setWordCount(words.length);
  };

  const handleTextFormat = (type) => {
    const textarea = textAreaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = content.substring(start, end);

    if (!selectedText) return;

    let replacement = '';

    switch (type) {
      case 'bold':
        replacement = `**${selectedText}**`;
        break;
      case 'italic':
        replacement = `*${selectedText}*`;
        break;
      case 'underline':
        replacement = `_${selectedText}_`;
        break;
      case 'clear':
        replacement = selectedText.replace(/[\*\_]/g, '');
        break;
      default:
        return;
    }

    const newText = content.substring(0, start) + replacement + content.substring(end);
    setContent(newText);
  };

  const handleOptionSelect = (option) => {
    setShowOptions(false);

    switch (option) {
      case 'summary':
        setButtonLabel('Summarize');
        setShowSummary(true);
        setShowDefine(false);
        setShowKeywords(false);
        setShowKeywordsNoteSlide(false);
        break;
      case 'define':
        setButtonLabel('Define');
        setShowDefine(true);
        setShowSummary(false);
        setShowKeywords(false);
        setShowKeywordsNoteSlide(false);
        setDefinitions(['']);
        break;
      case 'keywords':
        setButtonLabel('Keywords');
        setShowKeywords(true);
        setShowSummary(false);
        setShowDefine(false);
        setShowKeywordsNoteSlide(true);
        setKeywords(['']);
        break;
      default:
        setButtonLabel('Options');
        setShowSummary(false);
        setShowDefine(false);
        setShowKeywords(false);
        setShowKeywordsNoteSlide(false);
        setDefinitions(['']);
        setKeywords(['']);
        setNotesSlideContent('');
        break;
    }
  };

  const handleButtonClick = () => {
    if (buttonLabel === 'Summarize') {
      setShowSummary(true);
    } else if (buttonLabel === 'Define') {
      setShowDefine(true);
    } else if (buttonLabel === 'Keywords') {
      setShowKeywords(true);
      setShowKeywordsNoteSlide(true);
    }
  };

  const toggleDropdown = () => {
    setShowOptions((prev) => !prev);
  };

  const makeDialogMovable = (ref) => {
    if (!ref.current) return;

    const element = ref.current;
    let isMouseDown = false;
    let offset = { x: 0, y: 0 };

    const handleMouseDown = (e) => {
      isMouseDown = true;
      offset = {
        x: element.offsetLeft - e.clientX,
        y: element.offsetTop - e.clientY,
      };
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    };

    const handleMouseMove = (e) => {
      if (isMouseDown) {
        element.style.left = `${e.clientX + offset.x}px`;
        element.style.top = `${e.clientY + offset.y}px`;
      }
    };

    const handleMouseUp = () => {
      isMouseDown = false;
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    const header = element.querySelector('.movable-header');
    if (header) {
      header.addEventListener('mousedown', handleMouseDown);
    }
  };

  useEffect(() => {
    makeDialogMovable(summaryPopupRef);
    makeDialogMovable(definePopupRef);
    makeDialogMovable(keywordsPopupRef);
    makeDialogMovable(keywordsNoteSlidePopupRef);
  }, [showSummary, showDefine, showKeywords, showKeywordsNoteSlide]);

  return (
    <div className="container">
      {/* Header */}
      <div className="header">
        <div className="logo">EZNOTES</div>
        <div className="menu">File</div>
      </div>

      {/* Toolbar */}
      <div className="toolbar">
        <span className="star-icon">☆</span>

        <div className="font-size-control">
          <button onClick={() => setFontSize((prev) => Math.max(8, prev - 1))} className="font-size-button">
            −
          </button>
          <span className="font-size-display">{fontSize}</span>
          <button onClick={() => setFontSize((prev) => Math.min(72, prev + 1))} className="font-size-button">
            +
          </button>
        </div>

        <span className="font-family">Arial</span>

        <div className="text-format-buttons">
          <button onClick={() => handleTextFormat('bold')} className="format-button bold">
            B
          </button>
          <button onClick={() => handleTextFormat('italic')} className="format-button italic">
            I
          </button>
          <button onClick={() => handleTextFormat('underline')} className="format-button underline">
            U
          </button>
        </div>

        <button onClick={() => handleTextFormat('clear')} className="format-button clear">
          Clear Formatting
        </button>
      </div>

      <div className="main-content">
        {/* Left Panel */}
        <div className="left-panel">
          <div className="action-button dropdown-button" onClick={toggleDropdown}>
            <span>{buttonLabel}</span>
            <span className="dropdown-icon">▼</span>
          </div>

          {showOptions && (
            <div className="dropdown">
              <div className="dropdown-item" onClick={() => handleOptionSelect('summary')}>
                Summary
              </div>
              <div className="dropdown-item" onClick={() => handleOptionSelect('define')}>
                Define
              </div>
              <div className="dropdown-item" onClick={() => handleOptionSelect('keywords')}>
                Keywords
              </div>
            </div>
          )}

          <button onClick={() => setIsGenerating(!isGenerating)} className={`action-button ${isGenerating ? 'generating' : ''}`}>
            {isGenerating ? 'Continue Generating' : 'Generate'}
          </button>
        </div>

        {/* Editor */}
        <div className="editor-container">
          <div className="page">
            <textarea
              ref={textAreaRef}
              value={content}
              onChange={(e) => {
                setContent(e.target.value);
                handleWordCount(e.target.value);
              }}
              style={{ fontSize: `${fontSize}pt` }}
              className="textarea"
            />
            <div className="page-number">1</div>
          </div>
        </div>
      </div>

      {/* Status Bar */}
      <div className="status-bar">
        <div>Page 1</div>
        <div>Words: {wordCount}</div>
      </div>
    </div>
  );
};

export default EZNotes;
