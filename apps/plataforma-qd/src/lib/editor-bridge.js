export class EditorBridge {
  static instance;
  editor = null;
  monaco = null;
  
  static getInstance() {
    if (!this.instance) {
      this.instance = new EditorBridge();
    }
    return this.instance;
  }
  
  // Monaco registra su instancia
  setEditor(editor, monaco) {
    this.editor = editor;
    this.monaco = monaco;
  }
  
  // Chat llama esto cuando el agente responde con código
  insertCode(code, action = 'replace') {
    if (!this.editor) return;
    
    if (action === 'replace') {
      this.editor.setValue(code);
    } else {
      const position = this.editor.getPosition();
      this.editor.executeEdits('agent', [{
        range: new this.monaco.Range(
          position.lineNumber, 
          position.column,
          position.lineNumber, 
          position.column
        ),
        text: '\n' + code + '\n'
      }]);
    }
  }
  
  // Chat obtiene el código actual para enviarlo al agente
  getContext() {
    if (!this.editor) return null;
    
    const selection = this.editor.getSelection();
    const hasSelection = selection && !selection.isEmpty();
    
    return {
      code: this.editor.getValue(),
      selectedCode: hasSelection 
        ? this.editor.getModel()?.getValueInRange(selection)
        : null,
      language: this.editor.getModel()?.getLanguageId() || 'text',
      lineCount: this.editor.getModel()?.getLineCount() || 0
    };
  }
}
