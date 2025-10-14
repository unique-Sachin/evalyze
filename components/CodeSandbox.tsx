"use client";
import { useSandpack, SandpackProvider, SandpackLayout, SandpackCodeEditor, SandpackPreview } from "@codesandbox/sandpack-react";
import { aquaBlue } from "@codesandbox/sandpack-themes";
import { forwardRef, useImperativeHandle, useMemo, memo } from "react";

interface CodeSandboxProps {
  initialCode?: string;
  template?: "react" | "vanilla" | "vue" | "nextjs";
  dependencies?: Record<string, string>;
  files?: Record<string, { code: string; active?: boolean }>;
  editorHeight?: number;
}

export interface CodeSandboxRef {
  getCode: () => string;
}

// Internal component that has access to useSandpack and exposes getCode via ref
const CodeSandboxContent = memo(forwardRef<CodeSandboxRef, { editorHeight: number }>((props, ref) => {
  const { sandpack } = useSandpack();

  useImperativeHandle(ref, () => ({
    getCode: () => {
      // Get the active file or default to App.js
      const activeFile = sandpack.activeFile || '/App.js';
      return sandpack.files[activeFile]?.code || '';
    },
  }));

  return (
    <SandpackLayout style={{ height: '100%' }}>
      <SandpackCodeEditor 
        showLineNumbers
        showInlineErrors
        wrapContent
        style={{ height: props.editorHeight }}
      />
      <SandpackPreview 
        showNavigator
        style={{ height: props.editorHeight }}
      />
    </SandpackLayout>
  );
}));

CodeSandboxContent.displayName = 'CodeSandboxContent';

const CodeSandbox = forwardRef<CodeSandboxRef, CodeSandboxProps>(({
  initialCode,
  template = "react",
  dependencies,
  files,
  editorHeight = 500,
}, ref) => {
  // Memoize files to prevent re-initialization on every render
  // We intentionally use an empty dependency array to only initialize once
  // This prevents the editor from resetting when parent component re-renders
  const sandpackFiles = useMemo(() => {
    return files || {
      "/App.js": {
        code: initialCode || `export default function App() {
  return (
    <div>
      {/* Write your React code here */}
    </div>
  );
}`,
        active: true,
      },
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Empty dependency array - only initialize once!

  // Memoize dependencies
  const sandpackDependencies = useMemo(() => {
    return dependencies || { "react": "^18.2.0", "react-dom": "^18.2.0" };
  }, [dependencies]);

  return (
    <SandpackProvider
      template={template}
      theme={aquaBlue}
      files={sandpackFiles}
      customSetup={{ dependencies: sandpackDependencies }}
      options={{
        autorun: true,
        autoReload: true,
      }}
    >
      <CodeSandboxContent ref={ref} editorHeight={editorHeight} />
    </SandpackProvider>
  );
});

CodeSandbox.displayName = 'CodeSandbox';

export default memo(CodeSandbox);
