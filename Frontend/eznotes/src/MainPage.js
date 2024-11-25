import React, { useState, useRef, useEffect } from 'react';
import { Loader2 } from 'lucide-react';

const EZNotes = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [fontSize, setFontSize] = useState(11);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [showSummary, setShowSummary] = useState(false);
  const [showDefine, setShowDefine] = useState(false);
  const [showKeywords, setShowKeywords] = useState(false);
  const [showKeywordsNoteSlide, setShowKeywordsNoteSlide] = useState(false);
  const [isGeneratingSummary, setIsGeneratingSummary] = useState(false);
  const [isGeneratingDefine, setIsGeneratingDefine] = useState(false);
  const [isGeneratingKeywords, setIsGeneratingKeywords] = useState(false);
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

  const increaseFontSize = () => {
    setFontSize(prevSize => Math.min(prevSize + 1, 24)); // Max font size of 24pt
  };

  const decreaseFontSize = () => {
    setFontSize(prevSize => Math.max(prevSize - 1, 8)); // Min font size of 8pt
  };


  // Updated handleSummarize function
  const handleSummarize = async () => {
    setIsGeneratingSummary(true);
    try {
      const response = await fetch('http://localhost:5159/api/test/summarize-text', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text: content }),
      });
      if (!response.ok) {
        throw new Error('Failed to summarize');
      }
      const data = await response.json();
      setNotesSlideContent(data.summary);
      setShowSummary(false);
    } catch (error) {
      console.error('Error:', error);
      alert('Failed to summarize. Please try again later.');
    } finally {
      setIsGeneratingSummary(false);
    }
  };

  const handleDefine = async () => {
    setIsGeneratingDefine(true);
    try {
      const response = await fetch('http://localhost:5159/api/test/define-words', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ words: definitions.filter((word) => word.trim() !== "") }),
      });
      if (!response.ok) {
        throw new Error('Failed to define words');
      }
      const data = await response.json();
      setNotesSlideContent(data.definitions);
      setShowDefine(false);
    } catch (error) {
      console.error('Error:', error);
      alert('Failed to define words. Please try again later.');
    } finally {
      setIsGeneratingDefine(false);
    }
  };

  const handleKeywords = async () => {
    setIsGeneratingKeywords(true);
    try {
      // Add your keywords API endpoint here
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulated API call
      setShowKeywords(false);
    } catch (error) {
      console.error('Error:', error);
      alert('Failed to process keywords. Please try again later.');
    } finally {
      setIsGeneratingKeywords(false);
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

  const themes = {
    light: {
      background: '#f0f0f0',
      primaryBackground: 'white',
      secondaryBackground: '#f8f0ff',
      editorBackground: 'white',
      leftPanelBackground: '#f8f0ff',
      text: '#333',
      headerBg: 'white',
      border: '#ddd',
      actionButton: 'rgb(200, 100, 255)',
      logo: 'rgb(118, 0, 181)',
      editorContainer: '#f0f0f0',
      popup: {
        background: 'white',
        header: '#f9f9f9',
        border: '#e5e7eb',
        shadowColor: 'rgba(0, 0, 0, 0.1)'
      }
    },
    dark: {
      background: '#121212',
      primaryBackground: '#1E1E1E',
      secondaryBackground: '#2C2C2C',
      editorBackground: '#252525',
      leftPanelBackground: '#1C1C1C',
      text: '#E0E0E0',
      headerBg: '#1E1E1E',
      border: '#444',
      actionButton: 'rgb(160, 80, 205)',
      logo: 'rgb(200, 150, 255)',
      editorContainer: '#161616',
      page: '#6B6670',
      popup: {
        background: '#2A2A2A',
        header: '#3A3A3A',
        border: '#555',
        shadowColor: 'rgba(255, 255, 255, 0.1)'
      }
    }
  };  

  const getStyles = (theme) => ({
    container: {
      width: '100vw',
      height: '100vh',
      display: 'flex',
      flexDirection: 'column',
      backgroundColor: theme.background,
      transition: 'background-color 0.3s ease',
      color: theme.text,
    },
    header: {
      padding: '8px 16px',
      backgroundColor: theme.headerBg,
      transition: 'background-color 0.3s ease',
      borderBottom: `1px solid ${theme.border}`,
    },
    logo: {
      fontSize: '20px',
      color: theme.logo,
      fontWeight: 'bold',
    },
    menu: {
      fontSize: '13px',
      color: theme.background,
      transition: 'background-color 0.3s ease',
      marginTop: '2px',
    },
    toolbar: {
      backgroundColor: theme.secondaryBackground,
      transition: 'background-color 0.3s ease',
      padding: '6px 16px',
      display: 'flex',
      alignItems: 'center',
      gap: '16px',
      borderBottom: `1px solid ${theme.border}`,
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
      backgroundColor: isDarkMode ? 'rgba(255,255,255,0.2)' : 'white',
      color: isDarkMode ? 'white' : '#333',
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
      width: '325px',
      backgroundColor: theme.secondaryBackground,
      transition: 'background-color 0.3s ease',
      padding: '40px',
      borderRight: `1px solid ${theme.border}`,
      display: 'flex',
      flexDirection: 'column',
      gap: '16px',
    },
    actionButton: {
      backgroundColor: theme.actionButton,
      color: 'white',
      border: 'none',
      borderRadius: '30px',
      padding: '18px 16px', // Increased vertical padding
      cursor: 'pointer',
      textAlign: 'center',
      transition: 'background-color 0.3s ease',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      width: '95%', 
      height: '40px', // Added explicit height
    },
    dropdownIcon: {
      fontSize: '14px',
      cursor: 'pointer',
      marginLeft: '8px', // Added margin
    },
    dropdown: {
      position: '200px',
      backgroundColor: 'white',
      transition: 'background-color 0.3s ease',
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
      backgroundColor: theme.editorContainer,
      transition: 'background-color 0.3s ease',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      padding: '24px',
    },
    page: {
      width: '600px',
      height: '800px',
      minHeight: '800px',
      backgroundColor: theme.primaryBackground,
      transition: 'background-color 0.3s ease',
      boxShadow: `0 1px 3px ${theme.popup.shadowColor}`,
      position: 'relative',
      marginBottom: '24px',
      padding: '16px',
      overflow: 'hidden',
      border: `1px solid ${theme.border}`,
    },
    pageContainer: {
      border: `4px solid ${theme.border}`,
      padding: '16px',
      boxSizing: 'border-box',
      backgroundColor: theme.primaryBackground,
    },
    textarea: {
      width: '95%',
      height: '100%',
      padding: '16px',
      border: 'none',
      resize: 'none',
      outline: 'none',
      lineHeight: 1.5,
      fontFamily: 'Arial, sans-serif',
      backgroundColor: theme.primaryBackground,
      color: theme.text,
    },
    statusBar: {
    height: '24px',
    padding: '0 16px',
    backgroundColor: theme.secondaryBackground,
    borderTop: `1px solid ${theme.border}`,
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    fontSize: '12px',
    color: theme.text,
    },
    summaryPopup: {
      position: 'fixed',
      left: '20%',
      top: '15%',
      width: '400px',
      backgroundColor: theme.popup.background,
      transition: 'background-color 0.3s ease',
      borderRadius: '8px',
      boxShadow: `0 4px 6px ${theme.popup.shadowColor}`,
      padding: '16px',
      zIndex: 1000,
      border: `1px solid ${theme.popup.border}`,
    },
    summaryHeader: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '12px',
      cursor: 'grab',
      backgroundColor: theme.popup.header,
      padding: '8px',
      borderRadius: '4px',
    },
    summaryTitle: {
      margin: 0,
      transition: 'background-color 0.3s ease',
      color: theme.text,
      fontWeight: 600,
    },
    closeButton: {
      background: 'none',
      border: 'none',
      cursor: 'pointer',
      color: theme.text,
      fontSize: '18px',
    },
    summaryContent: {
      minHeight: '250px',
      height: '200px',
      border: `1px solid ${theme.popup.border}`,
      borderRadius: '4px',
      padding: '8px',
      transition: 'background-color 0.3s ease',
      backgroundColor: theme.page,
    },
    darkModeToggle: {
      position: 'absolute',
      top: '10px',
      right: '10px',
      zIndex: 1000,
      backgroundColor: theme.secondaryBackground,
      color: theme.text,
      transition: 'background-color 0.3s ease',
      border: `1px solid ${theme.border}`,
      padding: '8px 16px',
      borderRadius: '20px',
      cursor: 'pointer',
    },
    loadingIcon: {
      marginLeft: '8px',
      animation: 'spin 1s linear infinite',
    }
  });

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
  };

  const styles = getStyles(isDarkMode ? themes.dark : themes.light);

  return (
    <div style={styles.container}>
      {/* Dark Mode Toggle */}
      <div style={{
        position: 'absolute', 
        top: '10px', 
        right: '10px', 
        zIndex: 1000,
        display: 'flex',
        alignItems: 'center',
        gap: '10px'
      }}>
        {/* Font Size Controls */}
        <div style={styles.fontSizeControl}>
          <button 
            onClick={decreaseFontSize}
            style={styles.fontSizeButton}
          >
            -
          </button>
          <span style={styles.fontSizeDisplay}>{fontSize}</span>
          <button 
            onClick={increaseFontSize}
            style={styles.fontSizeButton}
          >
            +
          </button>
        </div>

        <button 
          onClick={toggleDarkMode}
          style={{
            backgroundColor: isDarkMode ? '#333' : '#f0f0f0',
            color: isDarkMode ? 'white' : 'black',
            border: 'none',
            padding: '5px 18px',
            borderRadius: '5px',
            cursor: 'pointer',
          }}
        >
          {isDarkMode ? '☀️ Light Mode' : '🌙 Dark Mode'}
        </button>
      </div>
  
      {/* Header */}
      <div style={styles.header}>
        <div style={styles.logo}>EZNOTES</div>
      </div>
  
      {/* Main Content */}
      <div style={styles.mainContent}>
        {/* Left Panel */}
        <div style={styles.leftPanel}>
          <div style={{
            ...styles.actionButton, 
            backgroundColor: '#C864FF'
          }}>
            <button
              onClick={handleButtonClick}
              style={{ 
                background: 'none', 
                border: 'none', 
                cursor: 'pointer', 
                color: isDarkMode ? themes.dark.text : 'white',
                fontSize: '25px' 
              }}
            >
              {buttonLabel}
            </button>
            <span 
              onClick={toggleDropdown} 
              style={{
                ...styles.dropdownIcon,
                color: isDarkMode ? themes.dark.text : 'inherit'
              }}
            >
              ▼
            </span>
          </div>
  
          {showOptions && (
            <div style={{
              ...styles.dropdown,
              backgroundColor: isDarkMode ? themes.dark.primaryBackground : 'white',
              fontSize: '20px',
              boxShadow: isDarkMode 
                ? '0 4px 6px rgba(255, 255, 255, 0.1)' 
                : '0 4px 6px rgba(0, 0, 0, 0.1)'
            }}>
              {['summary', 'define', 'keywords'].map((option) => (
                <div
                  key={option}
                  style={{
                    ...styles.dropdownItem,
                    color: isDarkMode ? themes.dark.text : '#374151',
                    '&:hover': {
                      backgroundColor: isDarkMode ? '#3C3C3C' : '#f3f4f6'
                    }
                  }}
                  onClick={() => handleOptionSelect(option)}
                >
                  {option.charAt(0).toUpperCase() + option.slice(1)}
                </div>
              ))}
            </div>
          )}
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
                  width: '95%',
                  height: 'calc(100% - 48px)',
                  outline: 'none',
                  resize: 'none',
                  backgroundColor: isDarkMode ? themes.dark.page : styles.statusBar.editorBackground,

                }}
              />
              <button
                onClick={handleSummarize}
                disabled={isGeneratingSummary}
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
                <span>{isGeneratingSummary ? 'Summarize' : 'Summarize'}</span>
                {isGeneratingSummary && <Loader2 size={16} style={styles.loadingIcon} />}
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
                      backgroundColor: isDarkMode ? themes.dark.page : styles.statusBar.editorBackground,

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
                <span>{isGeneratingDefine ? 'Define' : 'Define'}</span>
                {isGeneratingDefine && <Loader2 size={16} style={styles.loadingIcon} />}
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
                      backgroundColor: isDarkMode ? themes.dark.page : styles.statusBar.editorBackground,

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
                  backgroundColor: isDarkMode ? themes.dark.page : styles.statusBar.editorBackground,

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
                onChange={(e) => {
                setContent(e.target.value);
                handleWordCount(e.target.value);
                }}
                style={{
                  ...styles.textarea,
                  fontSize: `${fontSize}pt`,
                  backgroundColor: isDarkMode ? themes.dark.page : styles.statusBar.editorBackground,
                  borderTop: `1px solid ${isDarkMode ? themes.dark.border : '#ddd'}`,
                  color: isDarkMode ? themes.dark.text : styles.statusBar.color // Light gray to indicate read-only
                }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Status Bar */}
       <div style={{
      ...styles.statusBar,
      backgroundColor: isDarkMode ? themes.dark.secondaryBackground : styles.statusBar.backgroundColor,
      borderTop: `1px solid ${isDarkMode ? themes.dark.border : '#ddd'}`,
      color: isDarkMode ? themes.dark.text : styles.statusBar.color
    }}>
      <div>Page 1</div>
      <div>Words: {wordCount}</div>
    </div>
  </div>
  );
};

export default EZNotes;
