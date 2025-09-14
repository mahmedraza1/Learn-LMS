import React from "react";
import { Editor } from "@tinymce/tinymce-react";
import { Controller } from "react-hook-form";

const RTE = ({ name, control, label, defaultValue = "" }) => {
  return (
    <div className="w-full">
      {label && <label className="mb-1 block text-sm font-medium text-gray-700">{label}</label>}
      <Controller
        name={name || "content"}
        control={control}
        defaultValue={defaultValue}
        render={({ field: { onChange, value } }) => {
          console.log('RTE value:', value);
          return (
            <Editor
              tinymceScriptSrc="/tinymce/tinymce.min.js"
              licenseKey="gpl"
              value={value || defaultValue}
              init={{
              skin: "oxide",
              content_css: "default",
              height: 400,
              menubar: true,
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
                }
                h1 {
                  font-size: 1.5rem;
                  font-weight: bold;
                  color: #92400e;
                  border-bottom: 1px solid #f59e0b;
                  padding-bottom: 0.25rem;
                  margin-bottom: 0.75rem;
                }
                h2 {
                  font-size: 1.25rem;
                  font-weight: bold;
                  color: #92400e;
                  margin-bottom: 0.75rem;
                }
                h3 {
                  font-size: 1.125rem;
                  font-weight: bold;
                  color: #92400e;
                  margin-bottom: 0.75rem;
                }
                p {
                  margin-bottom: 0.75rem;
                }
                ul, ol {
                  margin-left: 1.5rem;
                  margin-bottom: 0.75rem;
                }
                ul {
                  list-style-type: disc;
                }
                ol {
                  list-style-type: decimal;
                }
                blockquote {
                  border-left: 3px solid #f59e0b;
                  padding-left: 0.75rem;
                  margin-left: 0.5rem;
                  margin-right: 0.5rem;
                  font-style: italic;
                  color: #78350f;
                }
              `,
              style_formats: [
                { title: 'Heading 1', format: 'h1' },
                { title: 'Heading 2', format: 'h2' },
                { title: 'Heading 3', format: 'h3' },
                { title: 'Paragraph', format: 'p' }
              ],
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
