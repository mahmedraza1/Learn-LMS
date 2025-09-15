import React from "react";
import { Editor } from "@tinymce/tinymce-react";
import { Controller } from "react-hook-form";

const RTE = ({ name, control, label, defaultValue = "" }) => {
  // Track when the editor has been initialized
  const [editorInitialized, setEditorInitialized] = React.useState(false);
  
  // Use effect to log the default value when it changes
  React.useEffect(() => {
    console.log('RTE defaultValue changed:', defaultValue);
  }, [defaultValue]);

  return (
    <div className="w-full editor-wrapper">
      {label && <label className="mb-1 block text-sm font-medium text-gray-700">{label}</label>}
      <Controller
        name={name || "content"}
        control={control}
        defaultValue={defaultValue}
        render={({ field: { onChange, value, ref } }) => {
          console.log('RTE rendering with value:', value, 'defaultValue:', defaultValue);
          return (
            <Editor
              key={`editor-${defaultValue?.length || 0}`} // Force re-render on defaultValue change
              tinymceScriptSrc="/tinymce/tinymce.min.js"
              licenseKey="gpl"
              onInit={(evt, editor) => {
                setEditorInitialized(true);
                console.log('Editor initialized');
              }}
              initialValue={defaultValue}
              value={value || defaultValue}
              init={{
              skin: "oxide",
              content_css: "default",
              height: 400,
              menubar: true,
              resize: false,
              statusbar: true,
              branding: false,
              promotion: false,
              elementpath: false,
              border_radius: 8,
              plugins: [
                "image",
                "advlist",
                "autolink",
                "lists",
                "link",
                "image",
                "charmap",
                "preview",
                "anchor",
                "searchreplace",
                "visualblocks",
                "code",
                "fullscreen",
                "insertdatetime",
                "media",
                "table",
                "code",
                "help",
                "wordcount",
                "anchor"
              ],
              toolbar:
                "undo redo | formatselect | blocks | " +
                "bold italic forecolor | alignleft aligncenter alignright alignjustify | " +
                "bullist numlist outdent indent | link image | removeformat | help",
              content_style: `
                body { 
                  font-family: Helvetica, Arial, sans-serif; 
                  font-size: 14px;
                  padding: 1rem;
                }
                h1 {
                  font-size: 1.5rem;
                  font-weight: bold;
                  color: #92400e;
                  border-bottom: 2px solid #f59e0b;
                  padding: 0.375rem 0.5rem;
                  margin-bottom: 0.75rem;
                  background-color: rgba(245, 158, 11, 0.1);
                  border-radius: 0.375rem;
                }
                h2 {
                  font-size: 1.25rem;
                  font-weight: bold;
                  color: #92400e;
                  margin-bottom: 0.75rem;
                  padding: 0.25rem 0.5rem;
                  background-color: rgba(245, 158, 11, 0.05);
                  border-radius: 0.375rem;
                }
                h3 {
                  font-size: 1.125rem;
                  font-weight: bold;
                  color: #92400e;
                  margin-bottom: 0.75rem;
                  padding: 0.25rem 0.5rem;
                  border-radius: 0.375rem;
                }
                p {
                  margin-bottom: 0.75rem;
                  padding: 0.25rem 0;
                }
                ul, ol {
                  margin-left: 1.5rem;
                  margin-bottom: 0.75rem;
                  padding: 0.25rem 0.5rem;
                  border-radius: 0.375rem;
                }
                ul {
                  list-style-type: disc;
                }
                ol {
                  list-style-type: decimal;
                }
                li {
                  margin-bottom: 0.25rem;
                  padding: 0.125rem 0;
                }
                a {
                  color: #0d7c66;
                  text-decoration: underline;
                  border-radius: 0.25rem;
                  padding: 0 0.125rem;
                  transition: background-color 0.2s, color 0.2s;
                }
                a:hover {
                  color: #0a6a58;
                  background-color: rgba(13, 124, 102, 0.1);
                }
                blockquote {
                  border-left: 3px solid #f59e0b;
                  padding: 0.75rem 1rem;
                  margin: 1rem 0.5rem;
                  font-style: italic;
                  color: #78350f;
                  background-color: rgba(245, 158, 11, 0.05);
                  border-radius: 0 0.375rem 0.375rem 0;
                  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
                }
                table {
                  border-collapse: separate;
                  border-spacing: 0;
                  margin-bottom: 1rem;
                  width: 100%;
                  border-radius: 0.375rem;
                  overflow: hidden;
                  border: 1px solid #fbbf24;
                }
                table th,
                table td {
                  border: 1px solid #fbbf24;
                  padding: 0.5rem 0.75rem;
                  text-align: left;
                }
                table th {
                  background-color: #fef3c7;
                  font-weight: 600;
                  border-bottom: 2px solid #f59e0b;
                }
                code {
                  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
                  background-color: #fef3c7;
                  padding: 0.125rem 0.25rem;
                  border-radius: 0.25rem;
                  border: 1px solid rgba(245, 158, 11, 0.2);
                  color: #92400e;
                  font-size: 0.875em;
                }
                pre {
                  background-color: #fef3c7;
                  padding: 0.75rem 1rem;
                  border-radius: 0.5rem;
                  overflow-x: auto;
                  margin-bottom: 1rem;
                  border: 1px solid rgba(245, 158, 11, 0.3);
                  box-shadow: inset 0 1px 2px rgba(0, 0, 0, 0.05);
                }
                img {
                  max-width: 100%;
                  height: auto;
                  margin: 0.75rem 0;
                  border-radius: 0.375rem;
                  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
                  border: 1px solid rgba(245, 158, 11, 0.3);
                }
              `,
              style_formats: [
                { title: 'Heading 1', format: 'h1' },
                { title: 'Heading 2', format: 'h2' },
                { title: 'Heading 3', format: 'h3' },
                { title: 'Paragraph', format: 'p' },
                { title: 'Blockquote', format: 'blockquote' },
                { title: 'Code', inline: 'code' },
                { title: 'Code Block', block: 'pre', wrapper: true }
              ],
              images_upload_handler: function (blobInfo, success, failure) {
                // This is a placeholder for image upload - would need server implementation
                setTimeout(function () {
                  success('data:' + blobInfo.blob().type + ';base64,' + blobInfo.base64());
                }, 100);
              },
            }}
            onEditorChange={(content) => {
              console.log('Editor content changed:', content);
              onChange(content);
            }}
          />
        )}}
      />
    </div>
  );
};

export default RTE;
