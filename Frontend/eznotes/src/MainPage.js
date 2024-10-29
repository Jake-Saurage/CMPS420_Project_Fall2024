import React, { useState, useRef } from 'react';

const EZNotes = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [fontSize, setFontSize] = useState(11);
  const [showSummary, setShowSummary] = useState(false);
  const [wordCount, setWordCount] = useState(0);
  const [content, setContent] = useState('');
  const textAreaRef = useRef(null);

  const handleWordCount = (text) => {
    const words = text.trim().split(/\s+/).filter(word => word.length > 0);
    setWordCount(words.length);
  };

  const handleTextFormat = (type) => {
    const textarea = textAreaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = content.substring(start, end);

    if (!selectedText) return;

    let newText = content;
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

    newText = content.substring(0, start) + replacement + content.substring(end);
    setContent(newText);
  };

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
    },
    whiteBox: {
      backgroundColor: 'white',
      border: '1px solid #ddd',
      borderRadius: '4px',
      height: '300px',
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
      width: '650px',
      minHeight: '800px',
      backgroundColor: 'white',
      boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
      position: 'relative',
      marginBottom: '24px',
    },
    textarea: {
      width: '100%',
      height: 'calc(100% - 48px)',
      padding: '96px 96px 84px 96px',
      border: 'none',
      resize: 'none',
      outline: 'none',
      lineHeight: 1.5,
      fontFamily: 'Arial, sans-serif',
    },
    pageNumber: {
      position: 'absolute',
      bottom: '40px',
      width: '100%',
      textAlign: 'center',
      color: '#666',
      fontSize: '10pt',
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
      position: 'absolute',
      left: '325px',
      top: '110px',
      width: '450px',
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
      minHeight: '400px',
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
        <div style={styles.menu}>File</div>
      </div>

      {/* Toolbar */}
      <div style={styles.toolbar}>
        <span style={{ color: '#ffd700' }}>☆</span>
        
        <div style={styles.fontSizeControl}>
          <button 
            onClick={() => setFontSize(prev => Math.max(8, prev - 1))}
            style={styles.fontSizeButton}
          >−</button>
          <span style={styles.fontSizeDisplay}>{fontSize}</span>
          <button 
            onClick={() => setFontSize(prev => Math.min(72, prev + 1))}
            style={styles.fontSizeButton}
          >+</button>
        </div>

        <span>Arial</span>

        <div style={{ display: 'flex', gap: '16px' }}>
          <button 
            onClick={() => handleTextFormat('bold')} 
            style={{ ...styles.formatButton, fontWeight: 'bold' }}
          >B</button>
          <button 
            onClick={() => handleTextFormat('italic')} 
            style={{ ...styles.formatButton, fontStyle: 'italic' }}
          >I</button>
          <button 
            onClick={() => handleTextFormat('underline')} 
            style={{ ...styles.formatButton, textDecoration: 'underline' }}
          >U</button>
        </div>

        <button 
          onClick={() => handleTextFormat('clear')}
          style={styles.formatButton}
        >
          Clear Formatting
        </button>
      </div>

      <div style={styles.mainContent}>
        {/* Left Panel */}
        <div style={styles.leftPanel}>
          <button
            onClick={() => setShowSummary(true)}
            style={styles.actionButton}
          >
            Summarize
          </button>
          <div style={styles.whiteBox} />
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
          <div style={styles.summaryPopup}>
            <div style={styles.summaryHeader}>
              <h3 style={styles.summaryTitle}>Summary</h3>
              <button 
                onClick={() => setShowSummary(false)}
                style={styles.closeButton}
              >
                ×
              </button>
            </div>
            <div style={styles.summaryContent} />
          </div>
        )}

        {/* Editor */}
        <div style={styles.editorContainer}>
          <div style={styles.page}>
            <textarea
              ref={textAreaRef}
              value={content}
              onChange={(e) => {
                setContent(e.target.value);
                handleWordCount(e.target.value);
              }}
              style={{
                ...styles.textarea,
                fontSize: `${fontSize}pt`,
              }}
            />
            <div style={styles.pageNumber}>1</div>
          </div>
        </div>
      </div>

      {/* Status Bar */}
      <div style={styles.statusBar}>
        <div>Page 1</div>
        <div>Words: {wordCount}</div>
      </div>
    </div>
  );
};

export default EZNotes;