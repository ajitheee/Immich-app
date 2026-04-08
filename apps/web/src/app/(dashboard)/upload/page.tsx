'use client';

import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { useMutation } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { formatBytes } from '@immich/utils';

interface UploadProgress {
  fileName: string;
  progress: number;
  status: 'uploading' | 'processing' | 'completed' | 'failed';
  error?: string;
}

export default function UploadPage() {
  const [uploads, setUploads] = useState<UploadProgress[]>([]);

  const uploadMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append('file', file);

      const response = await api.post('/upload/single', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent) => {
          const progress = progressEvent.total
            ? Math.round((progressEvent.loaded * 100) / progressEvent.total)
            : 0;

          setUploads((prev) =>
            prev.map((u) =>
              u.fileName === file.name ? { ...u, progress, status: 'uploading' } : u
            )
          );
        },
      });

      return response.data;
    },
    onSuccess: (_, file) => {
      setUploads((prev) =>
        prev.map((u) =>
          u.fileName === file.name ? { ...u, status: 'completed', progress: 100 } : u
        )
      );
    },
    onError: (error: any, file) => {
      setUploads((prev) =>
        prev.map((u) =>
          u.fileName === file.name
            ? { ...u, status: 'failed', error: error.message || 'Upload failed' }
            : u
        )
      );
    },
  });

  const onDrop = useCallback((acceptedFiles: File[]) => {
    // Add files to upload list
    const newUploads = acceptedFiles.map((file) => ({
      fileName: file.name,
      progress: 0,
      status: 'uploading' as const,
    }));
    setUploads((prev) => [...prev, ...newUploads]);

    // Upload each file
    acceptedFiles.forEach((file) => {
      uploadMutation.mutate(file);
    });
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.heic', '.heif'],
      'video/*': ['.mp4', '.mov', '.avi', '.mkv', '.webm'],
    },
    maxSize: 100 * 1024 * 1024, // 100MB
  });

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold text-white mb-8">Upload</h1>

      {/* Dropzone */}
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-xl p-12 text-center cursor-pointer transition-colors ${
          isDragActive
            ? 'border-primary-500 bg-primary-500/10'
            : 'border-dark-600 hover:border-dark-500'
        }`}
      >
        <input {...getInputProps()} />
        <svg
          className="w-16 h-16 text-dark-500 mx-auto mb-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"
          />
        </svg>
        {isDragActive ? (
          <p className="text-primary-500 text-lg">Drop your files here...</p>
        ) : (
          <>
            <p className="text-white text-lg mb-2">Drag & drop files here</p>
            <p className="text-dark-400 text-sm mb-4">or click to browse</p>
            <p className="text-dark-500 text-xs">
              Supports JPG, PNG, GIF, WEBP, HEIC, MP4, MOV, AVI, MKV, WEBM
              <br />
              Max file size: 100MB
            </p>
          </>
        )}
      </div>

      {/* Upload progress */}
      {uploads.length > 0 && (
        <div className="mt-8">
          <h2 className="text-lg font-medium text-white mb-4">Uploads</h2>
          <div className="space-y-4">
            {uploads.map((upload, index) => (
              <div key={index} className="card">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-3">
                    {upload.status === 'completed' && (
                      <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                    {upload.status === 'failed' && (
                      <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    )}
                    {upload.status === 'uploading' && (
                      <div className="w-5 h-5">
                        <div className="animate-spin rounded-full h-5 w-5 border-2 border-primary-500 border-t-transparent"></div>
                      </div>
                    )}
                    <span className="text-white truncate max-w-xs">{upload.fileName}</span>
                  </div>
                  <span className="text-dark-400 text-sm">
                    {upload.status === 'completed'
                      ? 'Completed'
                      : upload.status === 'failed'
                      ? 'Failed'
                      : `${upload.progress}%`}
                  </span>
                </div>

                {(upload.status === 'uploading' || upload.status === 'processing') && (
                  <div className="w-full bg-dark-700 rounded-full h-1">
                    <div
                      className="bg-primary-500 h-1 rounded-full transition-all"
                      style={{ width: `${upload.progress}%` }}
                    />
                  </div>
                )}

                {upload.error && (
                  <p className="text-red-500 text-sm mt-2">{upload.error}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}