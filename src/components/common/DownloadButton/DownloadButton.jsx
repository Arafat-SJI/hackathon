import React from 'react'
import { LuDownload } from "react-icons/lu";


function DownloadButton({ handleDownload, text }) {
  return (
    <div onClick={handleDownload} className="mt-2 flex items-center justify-end font-semibold">
        <div className='bg-cyan-600 text-white px-4 py-2 rounded-md hover:bg-cyan-700 flex items-center justify-center gap-1 cursor-pointer'>
            <button className='text-white cursor-pointer'>{text}</button>
            <LuDownload className='w-4 h-4' />
        </div>
    </div>
  )
}

export default DownloadButton