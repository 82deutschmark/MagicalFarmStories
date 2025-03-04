
import { useState, useRef } from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { apiRequest } from "@/lib/queryClient";
import { useQuery } from "@tanstack/react-query";

export default function DebugPage() {
  const [message, setMessage] = useState<string>('');
  const [error, setError] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadStatus, setUploadStatus] = useState<string>('');
  
  // Get table info
  const { data: tableInfo, isLoading: isLoadingInfo, refetch: refetchInfo } = useQuery({
    queryKey: ['/api/debug/tables/info'],
    queryFn: async () => {
      return await apiRequest("GET", "/api/debug/tables/info");
    }
  });

  const handleCreateTables = async () => {
    setMessage('');
    setError('');
    try {
      const response = await apiRequest("POST", "/api/debug/tables/create");
      setMessage(`Success: ${response.message}`);
      refetchInfo();
    } catch (err) {
      setError(`Error: ${err instanceof Error ? err.message : String(err)}`);
    }
  };

  const handleDropTables = async () => {
    setMessage('');
    setError('');
    try {
      const response = await apiRequest("POST", "/api/debug/tables/drop");
      setMessage(`Success: ${response.message}`);
      refetchInfo();
    } catch (err) {
      setError(`Error: ${err instanceof Error ? err.message : String(err)}`);
    }
  };

  const handleImageUpload = async () => {
    setMessage('');
    setError('');
    setUploadStatus('');
    
    if (!fileInputRef.current?.files?.[0]) {
      setError('Please select an image file');
      return;
    }
    
    const file = fileInputRef.current.files[0];
    
    if (!file.type.startsWith('image/')) {
      setError('File must be an image');
      return;
    }
    
    const formData = new FormData();
    formData.append('image', file);
    
    try {
      setUploadStatus('Uploading...');
      
      const response = await fetch('/api/debug/upload-image', {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Upload failed');
      }
      
      const data = await response.json();
      setMessage(`Image uploaded: ${data.fileName}`);
      setUploadStatus('Upload complete!');
      
      // Clear file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      
      refetchInfo();
    } catch (err) {
      setError(`Error: ${err instanceof Error ? err.message : String(err)}`);
      setUploadStatus('Upload failed');
    }
  };
  
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Database Debug Page</h1>
      
      {message && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
          {message}
        </div>
      )}
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}
      
      <Card className="p-4 mb-4">
        <h2 className="text-xl font-semibold mb-2">Database Tables</h2>
        {isLoadingInfo ? (
          <p>Loading...</p>
        ) : (
          <div>
            <p><strong>Tables in database:</strong> {tableInfo?.tables?.length || 0}</p>
            <ul className="list-disc pl-5 mb-2">
              {tableInfo?.tables?.map((table: any, index: number) => (
                <li key={index}>{table.table_name}</li>
              ))}
            </ul>
            <p><strong>Farm images count:</strong> {tableInfo?.counts?.farmImages || 0}</p>
            <p><strong>Stories count:</strong> {tableInfo?.counts?.stories || 0}</p>
          </div>
        )}
        <div className="flex space-x-2 mt-4">
          <Button onClick={handleCreateTables}>Create Tables</Button>
          <Button onClick={handleDropTables} variant="destructive">Drop Tables</Button>
          <Button onClick={() => refetchInfo()} variant="outline">Refresh</Button>
        </div>
      </Card>
      
      <Separator className="my-6" />
      
      <Card className="p-4">
        <h2 className="text-xl font-semibold mb-2">Upload Image</h2>
        <div className="flex flex-col space-y-4">
          <input 
            type="file" 
            ref={fileInputRef} 
            accept="image/*" 
            className="border p-2 rounded"
          />
          {uploadStatus && (
            <p className={uploadStatus.includes('failed') ? 'text-red-500' : 'text-blue-500'}>
              {uploadStatus}
            </p>
          )}
          <Button onClick={handleImageUpload}>Upload Image</Button>
        </div>
      </Card>
    </div>
  );
}
