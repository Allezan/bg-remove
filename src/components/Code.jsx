import React, { useState } from 'react';
import { MdOutlineFileDownload } from "react-icons/md";
import { HiOutlineDownload } from "react-icons/hi";
const Code = () => {
  const [file, setFile] = useState(null);
  const [outputImage, setOutputImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const API_KEY = 'HSKg1S7rX2evLNPqMAMeqaZT'; //update the api key by going on https://www.remove.bg/dashboard#api-key 
  const [fileChosen, setFileChosen] = useState(false);
  const [filePreview, setFilePreview] = useState(null); 

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFileChosen(true);
      setFile(selectedFile);

      // Generate preview for image files
      if (selectedFile.type.includes('image')) {
        const reader = new FileReader();
        reader.onloadend = () => {
          setFilePreview(reader.result);
        };
        reader.readAsDataURL(selectedFile);
      } else {
        setFilePreview(null);
      }
    } else {
      setFileChosen(false);
      setFile(null);
      setFilePreview(null);
    }
  };

  const truncateFileName = (fileName, maxLength) => {
    if (fileName.length <= maxLength) return fileName;
    return fileName.substring(0, maxLength) + '...';
  };

  const handleRemoveBg = async () => {
    if (!file) return;

    setLoading(true);

    // Convert file to Base64
    const toBase64 = (file) =>
      new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result);
        reader.onerror = (error) => reject(error);
      });

    try {
      const base64Image = await toBase64(file);

      const formData = new FormData();
      formData.append('image_file_b64', base64Image.split(',')[1]);
      formData.append('size', 'auto');

      const response = await fetch('https://api.remove.bg/v1.0/removebg', {
        method: 'POST',
        headers: {
          'X-Api-Key': API_KEY,
        },
        body: formData,
      });

      if (response.status !== 200) {
        console.error('Error:', response.status, response.statusText);
        setLoading(false);
        return;
      }

      const blob = await response.blob();
      const imageObjectURL = URL.createObjectURL(blob);
      setOutputImage(imageObjectURL);
    } catch (error) {
      console.error('Request failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = () => {
    if (!outputImage) return;

    const link = document.createElement('a');
    link.href = outputImage;
    link.download = 'output.png';  // You can specify the filename here
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className='container'>
      <div className="codingdiv">
        <h1>Remove Background from Image</h1>
        <div className="file_submit">
          <label className={`custom-file-upload ${fileChosen ? 'file-chosen' : ''}`}>
            <input type="file" accept='image/*' onChange={handleFileChange} />
            {fileChosen ? (
              <div>
                {filePreview && <img src={filePreview} alt="File Preview" style={{ height: '20px', borderRadius: '50%', marginRight: '5px' }} />}
                {truncateFileName(file.name, 10)} {/* Truncate file name to 20 characters */}
              </div>
            ) : 'Choose File'}
          </label>
          <button onClick={handleRemoveBg} className='remove' disabled={loading}>
            {loading ? 'Processing...' : 'Remove Background'}
          </button>
        
         
        </div>
        {outputImage && (
          <div className='image_dl'>
            <button className='btn_dl' onClick={handleDownload}> <span>Download</span> <span className='dlicon'><HiOutlineDownload/></span>  </button>
            <img src={outputImage} alt="Output" width={200} />
          </div>
        )  }
       {
        loading ?  <div className='lod'><center><div class="loader"></div></center> </div>:''
       }
      </div>
    </div>
  );
};

export default Code;
