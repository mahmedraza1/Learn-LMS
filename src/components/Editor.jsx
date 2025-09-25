import React from "react";
import { Editor as TinyMCEEditor } from "@tinymce/tinymce-react";

const Editor = ({ initialValue = "", value, onChange, onEditorChange, height = 500 }) => {
  // Use value prop if provided (controlled), otherwise use initialValue (uncontrolled)
  const editorProps = value !== undefined 
    ? { value } 
    : { initialValue };
  
  // Use onEditorChange if provided, otherwise use onChange
  const changeHandler = onEditorChange || onChange;

  return (
    <div className="editor-wrapper">
      <TinyMCEEditor
        tinymceScriptSrc="/tinymce/tinymce.min.js"
        licenseKey="gpl"
        {...editorProps}
        init={{
          skin: "oxide",
          content_css: "default",
          height,
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
            "undo redo | blocks | image | bold italic forecolor | alignleft aligncenter bold italic forecolor | alignleft aligncenter alignright alignjustify | bullist numlist outdent indent | removeformat | help",
          content_style: "body { font-family:Helvetica,Arial,sans-serif; font-size:14px }",
        }}
        onEditorChange={changeHandler}
      />
    </div>
  );
};

export default Editor;
