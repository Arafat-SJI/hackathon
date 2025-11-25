import React from 'react'

function NavHeader({ title, icon }) {
    return (
        <div className="p-4 bg-gradient-to-r from-cyan-900 via-cyan-700 to-cyan-700 text-white my-5 rounded-md flex items-center justify-between">
            <h1 className="max-w-4xl text-3xl font-bold">{title}</h1>
            <img src={icon} alt="summary" className="w-10 h-10" />
        </div>
    )
}

export default NavHeader