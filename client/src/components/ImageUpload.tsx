import { Upload, X } from 'lucide-react';
import { useRef } from 'react';

interface ImageUploadProps {
  value: string;
  onChange: (value: string) => void;
  label?: string;
  placeholder?: string;
}

export default function ImageUpload({
  value,
  onChange,
  label = '이미지',
  placeholder = '이미지를 선택하거나 URL을 입력하세요',
}: ImageUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const base64 = event.target?.result as string;
        onChange(base64);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value);
  };

  const handleClear = () => {
    onChange('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-2">
      {label && <label className="block text-sm font-medium">{label}</label>}

      {/* Image Preview */}
      {value && (
        <div className="relative w-full aspect-video bg-gray-900 rounded-lg overflow-hidden border border-gray-700">
          <img
            src={value}
            alt="preview"
            className="w-full h-full object-cover"
          />
          <button
            onClick={handleClear}
            className="absolute top-2 right-2 p-1 bg-red-600 hover:bg-red-700 rounded transition-colors"
          >
            <X className="w-4 h-4 text-white" />
          </button>
        </div>
      )}

      {/* Upload Area */}
      <div className="space-y-2">
        {/* File Input */}
        <div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 border-2 border-dashed border-gray-600 hover:border-blue-500 rounded-lg transition-colors text-sm font-medium"
          >
            <Upload className="w-4 h-4" />
            파일 선택
          </button>
        </div>

        {/* URL Input */}
        <input
          type="text"
          value={value}
          onChange={handleUrlChange}
          placeholder={placeholder}
          className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:border-blue-600"
        />
      </div>
    </div>
  );
}
