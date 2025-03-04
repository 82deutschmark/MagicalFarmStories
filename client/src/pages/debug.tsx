import { useState, useRef } from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { apiRequest } from "@/lib/queryClient";
import { useQuery } from "@tanstack/react-query";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@radix-ui/react-tabs";


export default function DebugPage() {
  const [message, setMessage] = useState<string>('');
  const [error, setError] = useState<string>('');
  const singleFileInputRef = useRef<HTMLInputElement>(null);
  const multipleFileInputRef = useRef<HTMLInputElement>(null);
  const [uploadStatus, setUploadStatus] = useState<string>('');
  const [uploadResults, setUploadResults] = useState<Array<{ fileName: string; source?: string; error?: string }>>([]);

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

  const handleSingleImageUpload = async () => {
    setMessage('');
    setError('');
    setUploadStatus('');

    if (!singleFileInputRef.current?.files?.[0]) {
      setError('Please select an image file');
      return;
    }

    const file = singleFileInputRef.current.files[0];

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
      setUploadResults([...uploadResults, { fileName: data.fileName }]);
      setMessage(`Image uploaded: ${data.fileName}`);
      setUploadStatus('Upload complete!');
      singleFileInputRef.current.value = '';
      refetchInfo();
    } catch (err) {
      setError(`Error: ${err instanceof Error ? err.message : String(err)}`);
      setUploadStatus('Upload failed');
    }
  };

  const handleMultipleImageUpload = async () => {
    setMessage('');
    setError('');
    setUploadStatus('Uploading...');
    setUploadResults([]);

    if (!multipleFileInputRef.current?.files?.length) {
      setError('Please select at least one file.');
      setUploadStatus('Upload failed');
      return;
    }

    const files = multipleFileInputRef.current.files;
    const uploadPromises = [];
    let results = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const formData = new FormData();
      formData.append('image', file);
      uploadPromises.push(
        fetch('/api/debug/upload-image', {
          method: 'POST',
          body: formData,
        })
          .then(async (response) => {
            if (!response.ok) {
              const errorData = await response.json();
              return { fileName: file.name, error: errorData.message || 'Upload failed', source: 'Multiple' };
            }
            const data = await response.json();
            return { fileName: data.fileName, source: 'Multiple' };
          })
          .catch((error) => ({ fileName: file.name, error: error.message, source: 'Multiple' }))
      );
    }
    try {
      results = await Promise.all(uploadPromises);
      setUploadResults([...uploadResults, ...results]);
      setUploadStatus('Upload complete!');
      setMessage(`Files uploaded`);
      multipleFileInputRef.current.value = '';
      refetchInfo();
    } catch (error) {
      setError(`Error: ${error.message}`);
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

      <Card className="mb-4 p-4">
        <h2 className="text-xl font-semibold mb-2">Upload Farm Animal Images</h2>

        <Tabs defaultValue="single">
          <TabsList className="mb-4">
            <TabsTrigger value="single">Single Image</TabsTrigger>
            <TabsTrigger value="multiple">Multiple Images / ZIP</TabsTrigger>
          </TabsList>

          <TabsContent value="single">
            <div className="flex flex-col gap-2">
              <p className="text-sm text-gray-500">Upload a single image file</p>
              <input 
                type="file" 
                ref={singleFileInputRef} 
                accept="image/*"
                className="border p-2 rounded"
              />
              <Button onClick={handleSingleImageUpload}>Upload Single Image</Button>
            </div>
          </TabsContent>

          <TabsContent value="multiple">
            <div className="flex flex-col gap-2">
              <p className="text-sm text-gray-500">Upload multiple image files or a ZIP file containing images</p>
              <input 
                type="file" 
                ref={multipleFileInputRef} 
                accept="image/*,application/zip"
                multiple
                className="border p-2 rounded"
              />
              <Button onClick={handleMultipleImageUpload}>Upload Files</Button>
            </div>
          </TabsContent>
        </Tabs>

        {uploadStatus && (
          <p className={`mt-2 ${uploadStatus.includes('failed') ? 'text-red-500' : 'text-blue-500'}`}>
            {uploadStatus}
          </p>
        )}

        {uploadResults.length > 0 && (
          <div className="mt-4">
            <h3 className="font-semibold">Upload Results:</h3>
            <div className="max-h-60 overflow-y-auto mt-2 border rounded p-2">
              <ul className="list-disc pl-5">
                {uploadResults.map((result, index) => (
                  <li key={index} className={result.error ? 'text-red-500' : 'text-green-500'}>
                    {result.fileName} {result.source ? `(${result.source})` : ''} 
                    {result.error ? ` - Error: ${result.error}` : ''}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}