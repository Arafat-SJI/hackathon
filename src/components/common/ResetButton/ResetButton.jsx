import React from 'react'

import { VscDebugRestart } from "react-icons/vsc";



function ResetButton({ handleReset }) {
    return (
        <div onClick={handleReset} className="mt-2 flex items-center justify-end font-semibold">
            <div className='bg-cyan-600 text-white px-4 py-2 rounded-md hover:bg-cyan-700 flex items-center gap-1 cursor-pointer'>
                <button className='text-white cursor-pointer' >Reset</button>
                <VscDebugRestart className='w-4 h-4' />
            </div>
        </div>
    )
}

export default ResetButton