import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import MonacoEditor from '@monaco-editor/react';
import { Rnd } from 'react-rnd';
import { XMarkIcon, CodeBracketIcon, ChevronUpDownIcon, SunIcon, MoonIcon, PlayIcon } from '@heroicons/react/24/solid';
import { Switch } from '@headlessui/react';

const SyncEditor = React.memo(({ isVisible, onClose, dataChannel }) => {
  const [code, setCode] = useState('// Start coding here');
  const [language, setLanguage] = useState('javascript');
  const [theme, setTheme] = useState('vs-dark');
  const [fontSize, setFontSize] = useState(14);
  const [output, setOutput] = useState('');
  const [outputHeight, setOutputHeight] = useState(200); // New state for output height
  const { session } = useSelector(state => state.liveExchange);
  const dispatch = useDispatch();
  const editorRef = useRef(null);
  const monacoRef = useRef(null);
  const rndRef = useRef(null);
  const outputRef = useRef(null);

  const handleEditorChange = useCallback((value) => {
    setCode(value);
    if (dataChannel && dataChannel.readyState === 'open') {
      dataChannel.send(JSON.stringify({
        type: 'CODE_UPDATE',
        content: value,
        language: language
      }));
    }
  }, [language, dataChannel]);

  const handleLanguageChange = useCallback((event) => {
    const newLanguage = event.target.value;
    setLanguage(newLanguage);
    if (editorRef.current && monacoRef.current) {
      const model = editorRef.current.getModel();
      if (model) {
        monacoRef.current.editor.setModelLanguage(model, newLanguage);
      }
    }
    if (dataChannel && dataChannel.readyState === 'open') {
      dataChannel.send(JSON.stringify({
        type: 'LANGUAGE_CHANGE',
        content: newLanguage
      }));
    }
  }, [dataChannel]);

  const toggleTheme = useCallback(() => {
    setTheme(prevTheme => prevTheme === 'vs-dark' ? 'vs-light' : 'vs-dark');
  }, []);

  const handleFontSizeChange = useCallback((event) => {
    setFontSize(Number(event.target.value));
  }, []);



  const simulatePythonOutput = useCallback((code) => {
    let output = '';
    const print = (text) => {
      output += text + '\n';
    };
    
    // Very basic simulation of Python's print function
    code = code.replace(/print\((.*?)\)/g, 'print($1)');
    
    try {
      // eslint-disable-next-line no-new-func
      new Function('print', code)(print);
    } catch (error) {
      output = `Error: ${error.message}`;
    }
    
    return output || 'No output';
  }, []);

  const runCode = useCallback(() => {
    console.log('Run button clicked');
    setOutput('Running code...');
    requestAnimationFrame(() => {
      try {
        let result;
        console.log('Executing code for language:', language);
        switch (language) {
          case 'javascript':
            const sandboxedEval = (code) => {
              return new Function('return ' + code)();
            };
            result = sandboxedEval(code);
            break;
          case 'python':
            result = simulatePythonOutput(code);
            break;
          case 'java':
          case 'csharp':
          case 'cpp':
            result = `Execution of ${language} is not supported in the browser. Consider using a backend service or a WebAssembly-based runtime for this language.`;
            break;
          default:
            result = `Execution of ${language} is not supported.`;
        }
        console.log('Execution result:', result);
        setOutput(String(result));
      } catch (error) {
        console.error('Error during code execution:', error);
        setOutput(`Error: ${error.message}`);
      }
    });
  }, [language, code, simulatePythonOutput]);

  const handleEditorDidMount = (editor, monaco) => {
    editorRef.current = editor;
    monacoRef.current = monaco;
  };

  const handleOutputResize = useCallback((e, direction, ref, delta, position) => {
    setOutputHeight(ref.offsetHeight);
  }, []);

  const editorOptions = useMemo(() => ({
    scrollBeyondLastLine: false,
    fontSize: fontSize,
    automaticLayout: true,
    lineNumbers: 'on',
    roundedSelection: false,
    cursorStyle: 'line',
    cursorWidth: 2,
    cursorBlinking: 'smooth',
    scrollbar: {
      useShadows: false,
      verticalScrollbarSize: 8,
      horizontalScrollbarSize: 8,
    },
    smoothScrolling: true,
    lineHeight: 1.5,
    padding: { top: 10, bottom: 10 },
    renderWhitespace: 'selection',
    fontLigatures: true,
  }), [fontSize]);

  useEffect(() => {
    if (dataChannel) {
      const handleMessage = (event) => {
        const data = JSON.parse(event.data);
        if (data.type === 'CODE_UPDATE') {
          setCode(data.content);
        } else if (data.type === 'LANGUAGE_CHANGE') {
          setLanguage(data.content);
          if (editorRef.current && monacoRef.current) {
            const model = editorRef.current.getModel();
            if (model) {
              monacoRef.current.editor.setModelLanguage(model, data.content);
            }
          }
        }
      };

      dataChannel.addEventListener('message', handleMessage);
      return () => {
        dataChannel.removeEventListener('message', handleMessage);
      };
    }
  }, [dataChannel]);



  return (
    <Rnd
      ref={rndRef}
      default={{
        x: window.innerWidth * 0.1,
        y: window.innerHeight * 0.1,
        width: window.innerWidth * 0.8,
        height: window.innerHeight * 0.8,
      }}
      minWidth={600}
      minHeight={400}
      bounds="window"
      className="z-50"
      dragHandleClassName="drag-handle"
    >
      <div className={`flex flex-col h-full rounded-lg shadow-2xl overflow-hidden border border-opacity-20 transition-colors duration-200 ${theme === 'vs-dark' ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-300'}`}>
        <div className={`px-4 py-3 drag-handle flex justify-between items-center transition-colors duration-200 ${theme === 'vs-dark' ? 'bg-gray-800 text-white' : 'bg-gray-100 text-gray-800'}`}>
          <div className="flex items-center space-x-2">
            <CodeBracketIcon className="h-5 w-5 text-blue-500" />
            <h2 className="text-lg font-semibold">SkillSync Code Editor</h2>
          </div>
          <div className="flex items-center space-x-4">
            <button
              onClick={toggleTheme}
              className="focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded-full p-1 transition-colors duration-200"
            >
              {theme === 'vs-dark' ? <SunIcon className="h-5 w-5 text-yellow-400" /> : <MoonIcon className="h-5 w-5 text-gray-600" />}
            </button>
            <button
              onClick={onClose}
              className={`focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded transition-colors duration-200 ${theme === 'vs-dark' ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-800'}`}
            >
              <XMarkIcon className="h-5 w-5" />
            </button>
          </div>
        </div>
        <div className={`p-3 flex items-center space-x-4 transition-colors duration-200 ${theme === 'vs-dark' ? 'bg-gray-800 text-white' : 'bg-gray-100 text-gray-800'}`}>
          <div className="relative">
            <select
              value={language}
              onChange={handleLanguageChange}
              className={`appearance-none rounded-md pl-3 pr-8 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-200 ${
                theme === 'vs-dark' ? 'bg-gray-700 text-white' : 'bg-white text-gray-800'
              }`}
            >
              <option value="javascript">JavaScript</option>
              <option value="python">Python</option>
              <option value="java">Java</option>
              <option value="csharp">C#</option>
              <option value="cpp">C++</option>
            </select>
          </div>
          <div className="flex items-center space-x-2">
            <label htmlFor="font-size" className="text-sm font-medium">Font Size:</label>
            <input
              id="font-size"
              type="number"
              min="8"
              max="30"
              value={fontSize}
              onChange={handleFontSizeChange}
              className={`w-16 rounded-md px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-200 ${
                theme === 'vs-dark' ? 'bg-gray-700 text-white' : 'bg-white text-gray-800'
              }`}
            />
          </div>
          <button
            onClick={runCode}
            className={`flex items-center space-x-2 px-3 py-1 rounded-md transition-colors duration-200 ${
              theme === 'vs-dark'
                ? 'bg-green-600 hover:bg-green-700 text-white'
                : 'bg-green-500 hover:bg-green-600 text-white'
            }`}
          >
            <PlayIcon className="h-4 w-4" />
            <span>Run</span>
          </button>
        </div>
        <div className="flex-grow flex flex-col relative">
          <div className="flex-grow" style={{ height: `calc(100% - ${outputHeight}px)` }}>
            <MonacoEditor
              height="100%"
              language={language}
              theme={theme}
              value={code}
              onChange={handleEditorChange}
              onMount={handleEditorDidMount}
              options={editorOptions}
            />
          </div>
          <div 
            className={`${theme === 'vs-dark' ? 'bg-gray-800 text-white' : 'bg-gray-100 text-gray-800'}`}
            style={{ height: outputHeight }}
          >
            <div className={`px-4 py-2 font-medium text-lg flex justify-between items-center ${
              theme === 'vs-dark' ? 'bg-gray-700 text-white' : 'bg-gray-200 text-gray-800'
            }`}>
              <span>Output</span>
              <button 
                className="text-sm text-blue-500 hover:text-blue-600 focus:outline-none"
                onClick={() => setOutputHeight(prev => prev === 150 ? 300 : 150)}
              >
                {outputHeight === 150 ? 'Expand' : 'Collapse'}
              </button>
            </div>
            <div
              ref={outputRef}
              className="p-4 overflow-auto"
              style={{ height: 'calc(100% - 40px)' }}
            >
              {output ? (
                <pre className="whitespace-pre-wrap text-sm">{output}</pre>
              ) : (
                <p className="text-gray-500 italic text-sm">No output yet. Run your code to see results.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </Rnd>
  );
});

SyncEditor.displayName = 'SyncEditor';

export default SyncEditor;