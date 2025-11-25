import React from 'react'

function ResponseHeader({ title, icon }) {
    return (
        <div className="flex items-center justify-between">
            <h2 className="text-2xl font-semibold mb-2 text-cyan-800">{title}</h2>
            <img src={icon} alt="questions" className="w-7 h-7" />
        </div>
    )
}

export default ResponseHeader