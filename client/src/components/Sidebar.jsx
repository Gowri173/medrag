import React, { useRef, useState } from 'react';
import { UploadCloud, FileText, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { uploadPdfs } from '../utils/api';

const Sidebar = () => {
    const [files, setFiles] = useState([]);
    const [isUploading, setIsUploading] = useState(false);
    const [status, setStatus] = useState(null);
    const fileInputRef = useRef(null);

    const handleFileChange = (e) => {
        if (e.target.files) {
            setFiles(Array.from(e.target.files));
            setStatus(null);
        }
    };

    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.dataTransfer.files) {
            setFiles(Array.from(e.dataTransfer.files));
            setStatus(null);
        }
    };

    const handleUpload = async () => {
        if (files.length === 0) return;
        
        setIsUploading(true);
        setStatus({ type: 'info', msg: 'Uploading and processing...' });
        
        try {
            const data = await uploadPdfs(files);
            setStatus({ type: 'success', msg: data.message });
            setFiles([]); // Clear after success
        } catch (error) {
            setStatus({ type: 'error', msg: error.message });
        } finally {
            setIsUploading(false);
        }
    };

    return (
        <div className="sidebar">
            <div className="sidebar-header">
                <h2>MedRAGnosis</h2>
                <p className="subtitle">AI Medical Knowledge Assistant</p>
            </div>

            <div className="upload-section">
                <div 
                    className="upload-dropzone"
                    onClick={() => fileInputRef.current?.click()}
                    onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); }}
                    onDrop={handleDrop}
                >
                    <UploadCloud size={32} color="var(--text-secondary)" style={{ marginBottom: '12px' }} />
                    <p style={{ fontSize: '0.9rem', color: 'var(--text-primary)' }}>Click or drag PDFs here</p>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '4px' }}>Supports multiple files</p>
                    <input 
                        type="file" 
                        multiple 
                        accept=".pdf" 
                        ref={fileInputRef}
                        onChange={handleFileChange}
                    />
                </div>

                {files.length > 0 && (
                    <div className="file-list">
                        {files.map((file, idx) => (
                            <div key={idx} className="file-item">
                                <FileText size={16} color="var(--accent-color)" />
                                <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                    {file.name}
                                </span>
                            </div>
                        ))}
                    </div>
                )}

                <button 
                    className="upload-btn" 
                    onClick={handleUpload}
                    disabled={files.length === 0 || isUploading}
                >
                    {isUploading ? <Loader2 size={18} className="spin" /> : 'Process Documents'}
                </button>

                {status && (
                    <div className={`status-msg ${status.type}`} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        {status.type === 'success' && <CheckCircle2 size={16} />}
                        {status.type === 'error' && <AlertCircle size={16} />}
                        <span>{status.msg}</span>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Sidebar;
