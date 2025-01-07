import React, { useState } from 'react';
import { JsonEditor } from 'json-edit-react'

// Main Component
const JSONEditor = () => {
  const [jsonData, setJsonData] = useState({});

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial' }}>
      <h3>JSON Tree Editor</h3>
      <JsonEditor
                data={jsonData}
                //onChange={handleJsonChange}
                rootName="data"
                //restrictTypeSelection={["string", "object"]}
                collapsible // Enables collapse/expand for nested objects
                showButtons // Shows add/remove buttons for fields
                maxWidth="100%"
                indent={2}
                //theme={githubLightTheme}
                enableClipboard={false}
                collapse={true}
                defaultValue="new value"
            />
      <h4>Generated JSON:</h4>
      <pre>{JSON.stringify(jsonData, null, 2)}</pre>
    </div>
  );
};

export default JSONEditor;
