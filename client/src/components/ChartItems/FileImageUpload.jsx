import React, { useState } from 'react';

const FileImageUpload = ({ sectionId }) => {
  const [uploadedFile, setUploadedFile] = useState(null);

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const fileUrl = URL.createObjectURL(file);
      setUploadedFile(fileUrl);
    }
  };

  return (
    <div key={sectionId} className="p-4 mt-4 bg-gray-50">
      <h3 className="font-semibold text-lg flex justify-between items-center">
        File/Image
      </h3>
      <div className="border p-4 mt-2">
        <input
          type="file"
          accept="image/*"
          onChange={handleFileUpload}
          className="border p-2 w-full"
        />
        {uploadedFile && (
          <div className="mt-2">
            <img src={uploadedFile} alt="Uploaded" className="max-w-full" />
          </div>
        )}
      </div>
    </div>
  );
};

export default FileImageUpload;
