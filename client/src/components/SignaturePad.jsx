import React, { useRef, useState, useEffect } from 'react';
import { Upload, PenTool, Trash2, CheckCircle2 } from 'lucide-react';
import { uploadAPI } from '../api/client';

export default function SignaturePad({ initialValue, onSave, label = 'Signature' }) {
  const [mode, setMode] = useState('draw'); // 'draw' | 'upload'
  const [signaturePreview, setSignaturePreview] = useState(initialValue || null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  
  const canvasRef = useRef(null);

  // Initialize canvas
  useEffect(() => {
    if (mode === 'draw' && canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      ctx.lineWidth = 2.5;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.strokeStyle = '#0f172a';
    }
  }, [mode]);

  // Drawing event handlers
  const startDrawing = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const ctx = canvas.getContext('2d');
    
    const clientX = e.clientX || (e.touches && e.touches[0].clientX);
    const clientY = e.clientY || (e.touches && e.touches[0].clientY);

    ctx.beginPath();
    ctx.moveTo(clientX - rect.left, clientY - rect.top);
    setIsDrawing(true);
  };

  const draw = (e) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const ctx = canvas.getContext('2d');

    const clientX = e.clientX || (e.touches && e.touches[0].clientX);
    const clientY = e.clientY || (e.touches && e.touches[0].clientY);

    ctx.lineTo(clientX - rect.left, clientY - rect.top);
    ctx.stroke();
  };

  const stopDrawing = () => {
    if (!isDrawing) return;
    setIsDrawing(false);
    // Export base64 from canvas
    const canvas = canvasRef.current;
    if (canvas) {
      const dataUrl = canvas.toDataURL('image/png');
      setSignaturePreview(dataUrl);
      if (onSave) onSave(dataUrl);
    }
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      setSignaturePreview(null);
      if (onSave) onSave(null);
    }
  };

  // File upload handler
  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploadError('');
    const validTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      setUploadError('Invalid format. Please select a PNG, JPG, or WebP image.');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setUploadError('File exceeds 5MB size limit.');
      return;
    }

    try {
      setUploading(true);
      const res = await uploadAPI.uploadSignature(file);
      if (res.success && res.data.url) {
        setSignaturePreview(res.data.url);
        if (onSave) onSave(res.data.url);
      }
    } catch (err) {
      setUploadError(err.message || 'Failed to upload signature image.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div style={{ marginTop: 8 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
        <span className="form-label" style={{ marginBottom: 0 }}>
          {label} <span className="required">*</span>
        </span>
        <div style={{ display: 'flex', gap: 6 }}>
          <button
            type="button"
            onClick={() => setMode('draw')}
            className={`btn btn-sm ${mode === 'draw' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ padding: '4px 8px', fontSize: '0.75rem' }}
          >
            <PenTool size={12} />
            Draw
          </button>
          <button
            type="button"
            onClick={() => setMode('upload')}
            className={`btn btn-sm ${mode === 'upload' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ padding: '4px 8px', fontSize: '0.75rem' }}
          >
            <Upload size={12} />
            Upload File
          </button>
        </div>
      </div>

      {mode === 'draw' ? (
        <div className="signature-box">
          <canvas
            ref={canvasRef}
            width={380}
            height={130}
            className="signature-canvas"
            onMouseDown={startDrawing}
            onMouseMove={draw}
            onMouseUp={stopDrawing}
            onMouseLeave={stopDrawing}
            onTouchStart={startDrawing}
            onTouchMove={draw}
            onTouchEnd={stopDrawing}
          />
          <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', maxWidth: 380, marginTop: 8 }}>
            <span style={{ fontSize: '0.72rem', color: '#64748b' }}>
              Sign within the box using your mouse or trackpad
            </span>
            <button
              type="button"
              onClick={clearCanvas}
              className="btn btn-secondary btn-sm"
              style={{ padding: '2px 8px', fontSize: '0.72rem', color: '#dc2626' }}
            >
              <Trash2 size={12} />
              Clear
            </button>
          </div>
        </div>
      ) : (
        <div className="signature-box" style={{ padding: '20px' }}>
          <input
            type="file"
            id="sig-file-input"
            accept="image/png,image/jpeg,image/webp"
            onChange={handleFileUpload}
            style={{ display: 'none' }}
          />
          <label
            htmlFor="sig-file-input"
            className="btn btn-secondary"
            style={{ cursor: 'pointer', marginBottom: 8 }}
          >
            <Upload size={15} />
            {uploading ? 'Uploading...' : 'Select Signature Image'}
          </label>
          <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
            Supported formats: PNG, JPG, WebP (Max 5MB)
          </span>
          {uploadError && <p className="form-error">{uploadError}</p>}
        </div>
      )}

      {/* Signature Preview Status */}
      {signaturePreview && (
        <div style={{
          marginTop: 10,
          padding: '8px 12px',
          background: '#f0fdf4',
          border: '1px solid #bbf7d0',
          borderRadius: 6,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <CheckCircle2 size={16} color="#16a34a" />
            <span style={{ fontSize: '0.78rem', color: '#166534', fontWeight: 600 }}>
              Signature captured successfully
            </span>
          </div>
          <img
            src={signaturePreview}
            alt="Signature Preview"
            style={{ height: 32, maxWidth: 120, objectFit: 'contain', background: '#fff', border: '1px solid #e2e8f0', borderRadius: 4, padding: 2 }}
          />
        </div>
      )}
    </div>
  );
}
