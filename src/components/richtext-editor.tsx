// Required parts

// The HugeRTE global. This must be before other HugeRTE imports.
import hugerte from "hugerte";

// The following imports can be in any order.

// The DOM model
import "hugerte/models/dom";

// The default icons. This is required, but you can import custom icons after it.
import "hugerte/icons/default";

// The silver theme. Customization of the look and feel of HugeRTE should be done by custom skins while still using the silver theme.
import "hugerte/themes/silver";

// The oxide skin (or you can use a custom one).
import "hugerte/skins/ui/oxide/skin.js";

// The content skin provided by oxide (or a different skin you're using).
import "hugerte/skins/ui/oxide/content.js";

// The default content CSS. This can also be replaced by a custom file if needed.
import "hugerte/skins/content/default/content.js";

// Plugins are optional
// This should correspond to your `plugins` config in the object passed to `hugerte.init()`.
import "hugerte/plugins/accordion";
import "hugerte/plugins/advlist";
import "hugerte/plugins/anchor";
import "hugerte/plugins/autolink";
import "hugerte/plugins/autoresize";
import "hugerte/plugins/autosave";
import "hugerte/plugins/charmap";
import "hugerte/plugins/code";
import "hugerte/plugins/codesample";
import "hugerte/plugins/directionality";
import "hugerte/plugins/fullscreen";
import "hugerte/plugins/image";
// We'll have to investigate before recommending to use this one: https://github.com/hugerte/hugerte/issues/24
// import 'hugerte/plugins/importcss';
import "hugerte/plugins/insertdatetime";
import "hugerte/plugins/link";
import "hugerte/plugins/lists";
import "hugerte/plugins/media";
import "hugerte/plugins/nonbreaking";
import "hugerte/plugins/pagebreak";
import "hugerte/plugins/preview";
import "hugerte/plugins/quickbars";
import "hugerte/plugins/save";
import "hugerte/plugins/searchreplace";
import "hugerte/plugins/table";
import "hugerte/plugins/template";
import "hugerte/plugins/visualblocks";
import "hugerte/plugins/visualchars";
import "hugerte/plugins/wordcount";

// NOTE: For the emoticons plugin, you'll need two imports:
import "hugerte/plugins/emoticons";
import "hugerte/plugins/emoticons/js/emojis";

// NOTE: For the help plugin, you'll need to import the localized keyboard navigation help
// even if it's in english.
import "hugerte/plugins/help";
import "hugerte/plugins/help/js/i18n/keynav/en.js";
// Whichever languages you need...
import "hugerte/plugins/help/js/i18n/keynav/de.js";
import { useEffect, useRef } from "react";

export const RichtextEditor = (props: {
  initialValue: string;
  onChange: (value: string) => void;
}) => {
  const { initialValue, onChange } = props;
  const editorRef = useRef<any>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (!textareaRef.current) return;

    hugerte
      .init({
        target: textareaRef.current!,
        height: 400,
        menubar: true,
        statusbar: false,
        plugins: [
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
          "help",
          "wordcount",
        ],
        toolbar:
          "undo redo | blocks | " +
          "bold italic forecolor | alignleft aligncenter " +
          "alignright alignjustify | bullist numlist outdent indent | " +
          "removeformat | help",
        content_style:
          "body { font-family:Helvetica,Arial,sans-serif; font-size:14px }",
        init_instance_callback: (editor: any) => {
          editorRef.current = editor;

          editor.on("Change", () => {
            onChange(editor.getContent());
          });
        },
      })
      .catch((error: any) => {
        console.error("HugeRTE initialization error:", error);
      });
  }, [onChange]);

  // Update content when initialValue changes
  useEffect(() => {
    if (editorRef.current && initialValue !== editorRef.current.getContent()) {
      editorRef.current.setContent(initialValue);
    }
  }, [initialValue]);

  return (
    <div
      style={{
        height: "100%",
        width: "100%",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <textarea
        ref={textareaRef}
        defaultValue={initialValue}
        onChange={(e) => onChange(e.target.value)}
        style={{
          width: "100%",
          height: "100%",
          border: "1px solid #ccc",
          padding: "10px",
          fontFamily: "monospace",
          fontSize: "14px",
          resize: "none",
        }}
        placeholder="Enter your notes here..."
      />
    </div>
  );
};
