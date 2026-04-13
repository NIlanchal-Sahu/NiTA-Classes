import ReactQuill from 'react-quill'
import 'react-quill/dist/quill.snow.css'

const modules = {
  toolbar: [
    [{ header: [1, 2, 3, false] }],
    ['bold', 'italic', 'underline'],
    [{ list: 'ordered' }, { list: 'bullet' }],
    [{ background: [] }],
    ['clean'],
  ],
}

export default function CourseChapterRichText({ value, onChange, className = '' }) {
  return (
    <div
      className={`rounded-lg border border-gray-600 bg-white text-gray-900 [&_.ql-toolbar]:rounded-t-lg [&_.ql-container]:rounded-b-lg [&_.ql-editor]:min-h-[220px] ${className}`}
    >
      <ReactQuill theme="snow" value={value || ''} onChange={onChange} modules={modules} />
    </div>
  )
}
