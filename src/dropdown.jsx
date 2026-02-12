import {motion, AnimatePresence} from 'framer-motion'
import {useState, useLayoutEffect} from 'react'

function Dropdown({toggle, visibility, ref, children, offset = '95%', duration = 300, className = ''}) {
    const [coords, setCoords] = useState({top: 0, bottom: 0, left: 0, isUpward: false})

    useLayoutEffect(() => {
        if (visibility && ref.current) {
        const rect = ref.current.getBoundingClientRect()
        const windowHeight = window.innerHeight
        const dropdownEstimatedHeight = 250

        const spaceBelow = windowHeight - rect.bottom
        const showUpward = spaceBelow < dropdownEstimatedHeight && rect.top > spaceBelow

        setCoords({
            top: rect.top,
            bottom: rect.bottom,
            left: rect.left, 
            isUpward: showUpward
        })
        }
    }, [visibility, ref])

    const motionProps = {
        initial: {opacity: 0, height: 0, scale: 0.95},
        animate: {opacity: 1, height: 'auto', scale: 1},
        exit: {opacity: 0, height: 0, scale: 0.95},
        transition: {duration: duration / 1000, ease: [0.4, 0, 0.2, 1]},
    }

    return (
        <AnimatePresence>
            {visibility && (
                <motion.div
                    {...motionProps}
                    style={{
                        display: 'flex',
                        width: '75%',
                        justifyContent: 'center',
                        position: 'absolute',
                        left: coords.left,
                        ...(coords.isUpward 
                            ? {bottom: window.innerHeight - coords.top + offset} 
                            : {top: coords.bottom + offset}),
                        zIndex: 1000,
                        overflow: 'hidden',
                        transformOrigin: coords.isUpward ? 'bottom left' : 'top left',
                    }}
                >
                    <div
                        style={{
                            width: '100%',
                            backgroundColor: '#101828',
                            border: '1px solid #1e2939',
                            borderRadius: '0.5rem',
                            boxShadow: '0 20px 25px -5px rgba(0,0,0,.5), 0 8px 10px -6px rgba(0,0,0,.4)'
                        }}
                        className={`${className}`}
                        onClick={toggle}
                    >
                        {children}
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
  )
}

export default Dropdown