import React from 'react'
import Loader from '../Loader/Loader'
import { FaArrowRight } from "react-icons/fa";


function GenerateButton({ loading, text }) {
    return (
        <div className="flex items-center justify-center bg-gradient-to-r from-cyan-700 via-cyan-600 to-cyan-500 text-white px-6 py-3 h-14 rounded-md hover:bg-gradient-to-r hover:from-cyan-800 hover:via-cyan-700 hover:to-cyan-600 font-semibold transition cursor-pointer">
            <button
                type="submit"
                disabled={loading}
                className='cursor-pointer'
            >
                {loading ? <Loader /> : text}
            </button>
            {loading ? <></> : <FaArrowRight className="ms-1 w-4 h-4" />}
        </div>
    )
}

export default GenerateButton