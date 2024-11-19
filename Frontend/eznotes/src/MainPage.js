import React, { useState, useRef } from 'react';

const EZNotes = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [fontSize, setFontSize] = useState(11);
  const [showSummary, setShowSummary] = useState(false);
  const [showDefine, setShowDefine] = useState(false);
  const [showKeywords, setShowKeywords] = useState(false);
  const [showKeywordsNoteSlide, setShowKeywordsNoteSlide] = useState(false);
  const [showOptions, setShowOptions] = useState(false);
  const [buttonLabel, setButtonLabel] = useState("Options");
  const [definitions, setDefinitions] = useState([""]);
  const [keywords, setKeywords] = useState([""]);
  const [notesSlideContent, setNotesSlideContent] = useState("");
  const [wordCount, setWordCount] = useState(0);
  const [content, setContent] = useState('');
  const textAreaRef = useRef(null);
  const summaryPopupRef = useRef(null);
  const definePopupRef = useRef(null);
  const keywordsPopupRef = useRef(null);
  const keywordsNoteSlidePopupRef = useRef(null);

  const handleWordCount = (text) => {
    const words = text.trim().split(/\s+/).filter(word => word.length > 0);
    setWordCount(words.length);
  };

  // Updated handleSummarize function
  const handleSummarize = async () => {
    try {
      const response = await fetch('http://localhost:5159/api/test/summarize-text', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text: content }), // Send the user's content
      });
      if (!response.ok) {
        throw new Error('Failed to summarize');
      }
      const data = await response.json();
      setNotesSlideContent(data.summary); // Set the summarized text in the right-hand space
      setShowSummary(false); // Close the summary popup
    } catch (error) {
      console.error('Error:', error);
      alert('Failed to summarize. Please try again later.');
    }
  };

  // Updated handleDefine function
  const handleDefine = async () => {
    try {
      const response = await fetch('http://localhost:5159/api/test/define-words', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ words: definitions.filter((word) => word.trim() !== "") }), // Filter out empty words
      });

      if (!response.ok) {
        throw new Error('Failed to define words');
      }

      const data = await response.json();
      setNotesSlideContent(data.definitions); // Display the definitions in the reserved space
      setShowDefine(false); // Close the Define popup
    } catch (error) {
      console.error('Error:', error);
      alert('Failed to define words. Please try again later.');
    }
  };

  const handleOptionSelect = (option) => {
    setShowOptions(false);

    switch (option) {
      case 'summary':
        setButtonLabel("Summarize");
        setShowSummary(true);
        setShowDefine(false);
        setShowKeywords(false);
        setShowKeywordsNoteSlide(false);
        break;
      case 'define':
        setButtonLabel("Define");
        setShowDefine(true);
        setShowSummary(false);
        setShowKeywords(false);
        setShowKeywordsNoteSlide(false);
        setDefinitions([""]);
        break;
      case 'keywords':
        setButtonLabel("Keywords");
        setShowKeywords(true);
        setShowSummary(false);
        setShowDefine(false);
        setShowKeywordsNoteSlide(true);
        setKeywords([""]);
        break;
      default:
        setButtonLabel("Options");
        setShowSummary(false);
        setShowDefine(false);
        setShowKeywords(false);
        setShowKeywordsNoteSlide(false);
        setDefinitions([""]);
        setKeywords([""]);
        setNotesSlideContent("");
        break;
    }
  };

  const handleButtonClick = () => {
    if (buttonLabel === "Summarize") {
      setShowSummary(true);
    } else if (buttonLabel === "Define") {
      setShowDefine(true);
    } else if (buttonLabel === "Keywords") {
      setShowKeywords(true);
      setShowKeywordsNoteSlide(true);
    }
  };

  const toggleDropdown = () => {
    setShowOptions((prev) => !prev);
  };

  const handleDefineChange = (index, value) => {
    const updatedDefinitions = [...definitions];
    updatedDefinitions[index] = value;
    setDefinitions(updatedDefinitions);
  };

  const handleDefineKeyDown = (e, index) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const updatedDefinitions = [...definitions];
      updatedDefinitions[index] = e.target.value;
      setDefinitions([...updatedDefinitions, ""]);
      setTimeout(() => {
        const nextInput = document.getElementById(`definition-${index + 1}`);
        if (nextInput) {
          nextInput.focus();
        }
      }, 0);
    }
  };

  const handleKeywordsChange = (index, value) => {
    const updatedKeywords = [...keywords];
    updatedKeywords[index] = value;
    setKeywords(updatedKeywords);
  };

  const handleKeywordsKeyDown = (e, index) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const updatedKeywords = [...keywords];
      updatedKeywords[index] = e.target.value;
      setKeywords([...updatedKeywords, ""]);
      setTimeout(() => {
        const nextInput = document.getElementById(`keyword-${index + 1}`);
        if (nextInput) {
          nextInput.focus();
        }
      }, 0);
    }
  };

  const handleNotesSlideChange = (e) => {
    setNotesSlideContent(e.target.value);
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

  React.useEffect(() => {
    makeDialogMovable(summaryPopupRef);
    makeDialogMovable(definePopupRef);
    makeDialogMovable(keywordsPopupRef);
    makeDialogMovable(keywordsNoteSlidePopupRef);
  }, [showSummary, showDefine, showKeywords, showKeywordsNoteSlide]);

  const styles = {
    container: {
      width: '100vw',
      height: '100vh',
      display: 'flex',
      flexDirection: 'column',
      backgroundColor: '#f0f0f0',
    },
    header: {
      padding: '8px 16px',
      backgroundColor: 'white',
      borderBottom: '1px solid #ddd',
    },
    logo: {
      fontSize: '20px',
      color: 'rgb(118, 0, 181)',
      fontWeight: 'bold',
    },
    menu: {
      fontSize: '13px',
      color: '#333',
      marginTop: '2px',
    },
    toolbar: {
      backgroundColor: '#f8f0ff',
      padding: '6px 16px',
      display: 'flex',
      alignItems: 'center',
      gap: '16px',
      borderBottom: '1px solid #ddd',
    },
    fontSizeControl: {
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
    },
    fontSizeButton: {
      background: 'none',
      border: 'none',
      cursor: 'pointer',
      fontSize: '16px',
      color: '#666',
    },
    fontSizeDisplay: {
      border: '1px solid #ddd',
      padding: '2px 8px',
      borderRadius: '2px',
      backgroundColor: 'white',
      minWidth: '24px',
      textAlign: 'center',
    },
    formatButton: {
      background: 'none',
      border: 'none',
      cursor: 'pointer',
      padding: '4px 8px',
      borderRadius: '4px',
    },
    mainContent: {
      display: 'flex',
      flex: 1,
      overflow: 'hidden',
    },
    leftPanel: {
      width: '275px',
      backgroundColor: '#f8f0ff',
      padding: '16px',
      borderRight: '1px solid #ddd',
      display: 'flex',
      flexDirection: 'column',
      gap: '16px',
    },
    actionButton: {
      backgroundColor: 'rgb(200, 100, 255)',
      color: 'white',
      border: 'none',
      borderRadius: '20px',
      padding: '8px 16px',
      cursor: 'pointer',
      textAlign: 'center',
      transition: 'background-color 0.3s ease',
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
    },
    dropdownIcon: {
      fontSize: '12px',
      cursor: 'pointer',
    },
    dropdown: {
      position: 'absolute',
      backgroundColor: 'white',
      boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
      borderRadius: '8px',
      padding: '8px 0',
      zIndex: 1000,
      minWidth: '150px',
      marginTop: '4px',
    },
    dropdownItem: {
      padding: '8px 16px',
      cursor: 'pointer',
      color: '#374151',
      '&:hover': {
        backgroundColor: '#f3f4f6',
      },
    },
    editorContainer: {
      flex: 1,
      overflowY: 'auto',
      backgroundColor: '#f0f0f0',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      padding: '24px',
    },
    page: {
      width: '600px',
      height: '800px',
      minHeight: '800px',
      backgroundColor: 'white',
      boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
      position: 'relative',
      marginBottom: '24px',
      padding: '16px',
      overflow: 'hidden', // Add overflow hidden to prevent scroll bars
    },
    pageContainer: {
      border: '4px solid black', // Wrap the page with a new container with a border
      padding: '16px',
      boxSizing: 'border-box',
    },
    textarea: {
      width: '100%',
      height: '100%', // Set height to 100% to fit the container
      padding: '16px',
      border: 'none',
      resize: 'none',
      outline: 'none',
      lineHeight: 1.5,
      fontFamily: 'Arial, sans-serif',
    },
    statusBar: {
      height: '24px',
      padding: '0 16px',
      backgroundColor: '#f8f0ff',
      borderTop: '1px solid #ddd',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      fontSize: '12px',
      color: '#666',
    },
    summaryPopup: {
      position: 'fixed', // Changed to fixed to prevent overlap
      left: '20%', // Adjusted position to fit within bounds
      top: '15%',
      width: '400px', // Reduced width to fit comfortably
      backgroundColor: 'white',
      borderRadius: '8px',
      boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
      padding: '16px',
      zIndex: 1000,
    },
    summaryHeader: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '12px',
      cursor: 'grab',
    },
    summaryTitle: {
      margin: 0,
      color: '#374151',
      fontWeight: 600,
    },
    closeButton: {
      background: 'none',
      border: 'none',
      cursor: 'pointer',
      color: '#6b7280',
      fontSize: '18px',
    },
    summaryContent: {
      minHeight: '200px', // Reduced height to fit
      height: '200px',
      border: '1px solid #e5e7eb',
      borderRadius: '4px',
      padding: '8px',
    },
  };

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <div style={styles.logo}>EZNOTES</div>
      </div>
      {/* Main Content */}
      <div style={styles.mainContent}>
        {/* Left Panel */}
        <div style={styles.leftPanel}>
          <div style={styles.actionButton}>
            <button
              onClick={handleButtonClick}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'white' }}
            >
              {buttonLabel}
            </button>
            <span onClick={toggleDropdown} style={styles.dropdownIcon}>
              ▼
            </span>
          </div>

          {showOptions && (
            <div style={styles.dropdown}>
              <div
                style={styles.dropdownItem}
                onClick={() => handleOptionSelect('summary')}
              >
                Summary
              </div>
              <div
                style={styles.dropdownItem}
                onClick={() => handleOptionSelect('define')}
              >
                Define
              </div>
              <div
                style={styles.dropdownItem}
                onClick={() => handleOptionSelect('keywords')}
              >
                Keywords
              </div>
            </div>
          )}

          <button
            onClick={() => setIsGenerating(!isGenerating)}
            style={{
              ...styles.actionButton,
              backgroundColor: isGenerating ? 'rgb(160, 60, 215)' : 'rgb(200, 100, 255)',
            }}
          >
            {isGenerating ? 'Continue Generating' : 'Generate'}
          </button>
        </div>

        {/* Summary Popup */}
        {showSummary && (
          <div ref={summaryPopupRef} style={{ ...styles.summaryPopup, minHeight: '200px' }}>
            <div className="movable-header" style={styles.summaryHeader}>
              <h3 style={styles.summaryTitle}>Summary</h3>
              <button
                onClick={() => setShowSummary(false)}
                style={styles.closeButton}
              >
                ×
              </button>
            </div>
            <div style={styles.summaryContent}>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                style={{
                  width: '100%',
                  height: 'calc(100% - 48px)',
                  padding: '8px',
                  border: '1px solid #e5e7eb',
                  borderRadius: '4px',
                  outline: 'none',
                  resize: 'none',
                }}
              />
              <button
                onClick={handleSummarize}
                style={{
                  marginTop: '8px',
                  padding: '8px 16px',
                  backgroundColor: 'rgb(118, 0, 181)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                }}
              >
                Summarize
              </button>
            </div>
          </div>
        )}

        {/* Define Popup */}
        {showDefine && (
          <div ref={definePopupRef} style={styles.summaryPopup}>
            <div className="movable-header" style={styles.summaryHeader}>
              <h3 style={styles.summaryTitle}>Definitions</h3>
              <button
                style={styles.closeButton}
                onClick={() => setShowDefine(false)}
              >
                ×
              </button>
            </div>
            <div style={styles.summaryContent}>
              {definitions.map((definition, index) => (
                <div key={index} style={styles.definitionItem}>
                  <span>• </span>
                  <input
                    id={`definition-${index}`}
                    type="text"
                    value={definition}
                    onChange={(e) => handleDefineChange(index, e.target.value)}
                    onKeyDown={(e) => handleDefineKeyDown(e, index)}
                    style={{
                      width: 'calc(100% - 24px)',
                      border: 'none',
                      outline: 'none',
                      padding: '4px',
                      marginBottom: '8px',
                    }}
                  />
                </div>
              ))}
              <button
                onClick={handleDefine} // Call the AI define function
                style={{
                  marginTop: '8px',
                  padding: '8px 16px',
                  backgroundColor: 'rgb(118, 0, 181)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                }}
              >
                Define Words
              </button>
            </div>
          </div>
        )}

        {/* Keywords Popup */}
        {showKeywords && (
          <div ref={keywordsPopupRef} style={{ ...styles.summaryPopup, top: '20%', width: '400px' }}>
            <div className="movable-header" style={styles.summaryHeader}>
              <h3 style={styles.summaryTitle}>Keywords</h3>
              <button style={styles.closeButton} onClick={() => setShowKeywords(false)}>
                ×
              </button>
            </div>
            <div style={styles.summaryContent}>
              {keywords.map((keyword, index) => (
                <div key={index} style={styles.definitionItem}>
                  <span>• </span>
                  <input
                    id={`keyword-${index}`}
                    type="text"
                    value={keyword}
                    onChange={(e) => handleKeywordsChange(index, e.target.value)}
                    onKeyDown={(e) => handleKeywordsKeyDown(e, index)}
                    style={{
                      width: 'calc(100% - 24px)',
                      border: 'none',
                      outline: 'none',
                      padding: '4px',
                      marginBottom: '8px',
                    }}
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Keywords Note Slide */}
        {showKeywordsNoteSlide && (
          <div ref={keywordsNoteSlidePopupRef} style={{ ...styles.summaryPopup, top: '50%', width: '400px' }}>
            <div className="movable-header" style={styles.summaryHeader}>
              <h3 style={styles.summaryTitle}>Notes/Slide</h3>
              <button style={styles.closeButton} onClick={() => setShowKeywordsNoteSlide(false)}>
                ×
              </button>
            </div>
            <div style={styles.summaryContent}>
              <textarea
                value={notesSlideContent}
                onChange={handleNotesSlideChange}
                style={{
                  width: '100%',
                  height: 'calc(100% - 48px)',
                  padding: '8px',
                  border: '1px solid #e5e7eb',
                  borderRadius: '4px',
                  outline: 'none',
                  resize: 'none',
                }}
              />
            </div>
          </div>
        )}

        {/* Editor */}
        <div style={styles.editorContainer}>
          <div style={styles.pageContainer}>
            <div style={styles.page}>
              <textarea
                ref={textAreaRef}
                value={notesSlideContent} // Use the AI-generated content here
                readOnly // Make it read-only
                style={{
                  ...styles.textarea,
                  fontSize: `${fontSize}pt`,
                  backgroundColor: '#f9f9f9', // Light gray to indicate read-only
                }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Status Bar */}
      <div style={styles.statusBar}>
        <div>Words: {wordCount}</div>
      </div>
    </div>
  );
};

export default EZNotes;
