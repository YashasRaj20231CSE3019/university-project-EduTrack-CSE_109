import React, { useState, useRef } from 'react';
import { apiService } from '../services/apiService';

interface AttendanceCSVImportProps {
  onImportSuccess: () => void;
}

const AttendanceCSVImport: React.FC<AttendanceCSVImportProps> = ({ onImportSuccess }) => {
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<any | null>(null);
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
      const droppedFile = e.dataTransfer.files[0];
      if (droppedFile.type === 'text/csv' || droppedFile.name.endsWith('.csv')) {
        setFile(droppedFile);
        setError(null);
        setResult(null);
      } else {
        setError('Please upload a valid CSV file.');
      }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
      setError(null);
      setResult(null);
    }
  };

  const handleUpload = async () => {
    if (!file) return;
    
    setIsUploading(true);
    setError(null);
    
    try {
      const data = await apiService.importAttendanceCSV(file);
      setResult(data);
      setFile(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
      onImportSuccess();
    } catch (err: any) {
      setError(err.message || 'Failed to import CSV');
    } finally {
      setIsUploading(false);
    }
  };

  const downloadTemplate = () => {
    const template = 'Date,Email,Status\n2023-10-25,student@school.edu,Present\n2023-10-25,another@school.edu,Absent';
    const blob = new Blob([template], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'attendance_template.csv';
    link.click();
  };

  return (
    <div className="bg-white p-4 md:p-8 rounded-[2rem] border border-slate-200 shadow-sm mb-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl md:text-2xl font-black text-slate-800">Bulk Import Attendance</h2>
        <button 
          onClick={downloadTemplate}
          className="text-xs font-bold text-indigo-600 hover:text-indigo-700 uppercase tracking-wider flex items-center gap-1"
        >
          <span>📄</span> Download Template
        </button>
      </div>
      
      <div 
        className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors ${
          isDragging ? 'border-indigo-500 bg-indigo-50' : 'border-slate-200 hover:border-slate-300'
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
      >
        <input 
          type="file" 
          accept=".csv" 
          className="hidden" 
          ref={fileInputRef}
          onChange={handleFileChange}
        />
        
        <div className="text-4xl mb-3">📁</div>
        <p className="text-sm font-bold text-slate-700 mb-1">
          {file ? file.name : 'Drag & drop your CSV file here'}
        </p>
        <p className="text-xs text-slate-500">
          or click to browse files
        </p>
      </div>

      {error && (
        <div className="mt-4 p-3 bg-rose-50 text-rose-600 border border-rose-200 rounded-xl text-sm font-medium flex items-center gap-2">
          <span>⚠️</span> {error}
        </div>
      )}

      {result && (
        <div className="mt-4 p-4 bg-emerald-50 border border-emerald-200 rounded-xl">
          <div className="flex items-center gap-2 text-emerald-700 font-bold mb-2">
            <span>✅</span> Import Successful
          </div>
          <ul className="text-sm text-emerald-600 space-y-1 ml-6 list-disc">
            <li>Processed {result.datesProcessed} unique dates</li>
            <li>Skipped {result.skippedRows} invalid rows</li>
            {result.summary.map((s: any, i: number) => (
              <li key={i}>{s.date}: {s.imported} students marked present</li>
            ))}
          </ul>
        </div>
      )}

      <div className="mt-4 flex justify-end">
        <button
          onClick={handleUpload}
          disabled={!file || isUploading}
          className="px-6 py-2 bg-indigo-600 text-white rounded-xl font-bold text-sm shadow-md hover:bg-indigo-700 transition-colors disabled:opacity-50 flex items-center gap-2"
        >
          {isUploading ? (
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
          ) : (
            <span>⬆️</span>
          )}
          {isUploading ? 'Importing...' : 'Upload & Import'}
        </button>
      </div>
    </div>
  );
};

export default AttendanceCSVImport;
