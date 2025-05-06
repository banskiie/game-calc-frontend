"use client";
import React, { useEffect, useState } from "react";
import { Card, CardHeader } from "@/components/ui/card";
import { ScrollText } from "lucide-react";
import { Separator } from "@/components/ui/separator";

const SummaryHistoryPage = () => {
  const [csvFiles, setCsvFiles] = useState<{ fileName: string; date: string }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCsvFiles = async () => {
      try {
        const response = await fetch('https://192.168.6.99:10000/api/csv-files'); // this is the url of the backend
        console.log('Response:', response); 
        if (!response.ok) {
            throw new Error(`Network response was not ok: ${response.statusText}`);
        }
        
        const data = await response.json();

        const sortedFiles = data.files.sort((a: any, b: any) => {
            if (a.date !== b.date) {
                return new Date(b.date).getTime() - new Date(a.date).getTime();
            }
        
            const numA = parseInt(a.fileName.match(/_(\d+)\.csv$/)?.[1] || '0', 10);
            const numB = parseInt(b.fileName.match(/_(\d+)\.csv$/)?.[1] || '0', 10);
        
            return numB - numA;
        });

        console.log('Data:', data); 
        setCsvFiles(sortedFiles);
      } catch (error) {
        console.error('Error fetching CSV files:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCsvFiles();
  }, []);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", { month: "long", day: "2-digit", year: "numeric" });
  };

  const groupFilesByDate = (files: { fileName: string, date: string }[]) => {
    return files.reduce((acc, file) => {
        const date = file.date;
        if (!acc[date]) {
            acc[date] = [];
        }
        if (acc[date].length < 10) {
            acc[date].push(file);
        }
        return acc;
    }, {} as { [key: string]: { fileName: string; date: string }[] });
  };

  const groupedFiles = groupFilesByDate(csvFiles);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="h-screen w-full bg-gray-100 flex flex-col items-center overflow-y-auto">
      <div className="w-full h-52 bg-green-600 rounded-b-2xl relative"></div>

      <div className="w-full max-w-4xl p-6">
        <div className="flex items-center gap-2 mb-12">
          <ScrollText className="w-6 h-6" />
          <h1 className="text-2xl font-bold">Game Summary History</h1>
        </div>

        <Separator className="my-6 border-t-2 border-gray-300" />

        {Object.entries(groupedFiles).map(([date, files]) => (
          <div key={date}>
            <h2 className="text-xl font-bold mb-4">{formatDate(date)}</h2>
            <div className="grid grid-cols-1 gap-6 mb-8">
              {files.map((file, index) => (
                <Card key={index}>
                  <CardHeader className="flex flex-col sm:flex-row items-center justify-between gap-4 w-full">
                    <div className="flex flex-col sm:flex-row items-center gap-2 text-center sm:text-left w-full sm:w-auto">
                      <ScrollText className="sm:mr-2" size={20} />
                      <span className="text-md font-medium lg:truncate md:truncate w-40 sm:w-56 md:w-72 lg:w-auto">
                        {file.fileName}
                      </span>
                    </div>
                    <a
                      href={`https://192.168.6.99:10000/api/csv-files/download?file=${file.fileName}`}
                      download
                      className="inline-flex justify-center items-center px-4 py-2 w-full sm:w-auto text-sm text-white bg-green-600 hover:bg-green-700 transition-all duration-300 rounded-lg shadow-md text-center"
                    >
                      Download CSV
                    </a>
                  </CardHeader>
                </Card>
              ))}
            </div>
            <Separator className="my-6 border-t-2 border-gray-300" />
          </div>
        ))}
      </div>
    </div>
  );
};

export default SummaryHistoryPage;