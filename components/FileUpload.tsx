
import React, { useState, useRef } from 'react';

interface FileUploadProps {
  onFileSelect: (file: File) => void;
}

const FileUpload: React.FC<FileUploadProps> = ({ onFileSelect }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      setSelectedFile(file);
      onFileSelect(file);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      setSelectedFile(file);
      onFileSelect(file);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const clearFile = (e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedFile(null);
  };

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={triggerFileInput}
      className={`relative group cursor-pointer border-2 border-dashed rounded-[2rem] p-8 transition-all duration-300 flex flex-col items-center justify-center gap-4 ${
        isDragging 
          ? 'border-indigo-500 bg-indigo-50/50 scale-[0.99] shadow-inner' 
          : 'border-slate-200 bg-slate-50/30 hover:border-indigo-300 hover:bg-white hover:shadow-xl hover:shadow-indigo-50/50'
      }`}
    >
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        className="hidden"
      />

      <div className={`w-16 h-16 rounded-2xl flex items-center justify-center text-3xl transition-transform duration-300 ${
        isDragging ? 'scale-110 rotate-12' : 'group-hover:scale-110'
      } ${selectedFile ? 'bg-emerald-50 text-emerald-600' : 'bg-indigo-50 text-indigo-600'}`}>
        {selectedFile ? '📄' : '📤'}
      </div>

      <div className="text-center">
        {selectedFile ? (
          <div className="space-y-1">
            <p className="text-sm font-black text-slate-800 truncate max-w-[250px]">
              {selectedFile.name}
            </p>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
              {(selectedFile.size / 1024).toFixed(1)} KB • Click to change
            </p>
            <button 
              onClick={clearFile}
              className="mt-2 text-[10px] font-black text-rose-500 uppercase tracking-widest hover:text-rose-600 transition-colors"
            >
              Remove File
            </button>
          </div>
        ) : (
          <div className="space-y-1">
            <p className="text-sm font-black text-slate-800">
              {isDragging ? 'Drop it here!' : 'Drag & drop your file'}
            </p>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
              Or click to browse from your device
            </p>
          </div>
        )}
      </div>

      {/* Decorative corners */}
      <div className="absolute top-4 left-4 w-4 h-4 border-t-2 border-l-2 border-slate-200 rounded-tl-lg group-hover:border-indigo-300 transition-colors"></div>
      <div className="absolute top-4 right-4 w-4 h-4 border-t-2 border-r-2 border-slate-200 rounded-tr-lg group-hover:border-indigo-300 transition-colors"></div>
      <div className="absolute bottom-4 left-4 w-4 h-4 border-b-2 border-l-2 border-slate-200 rounded-bl-lg group-hover:border-indigo-300 transition-colors"></div>
      <div className="absolute bottom-4 right-4 w-4 h-4 border-b-2 border-r-2 border-slate-200 rounded-br-lg group-hover:border-indigo-300 transition-colors"></div>
    </div>
  );
};

export default FileUpload;
