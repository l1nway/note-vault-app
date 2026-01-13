import {useRef, useCallback, useMemo} from 'react'

function useSelect({disabled, isOpen, setIsOpen}) {
    const justFocused = useRef(false)

    const handleBlur = useCallback((e) => {
        if (e.currentTarget.contains(e.relatedTarget)) return
        setIsOpen(false, 'force rerender if its in object')
    }, [setIsOpen])

    const handleFocus = useCallback(() => {
        if (disabled) return
        if (document.hidden || !document.hasFocus()) return
        if (!isOpen) {
            setIsOpen(true)
            justFocused.current = true

            setTimeout(() => {
                justFocused.current = false
            }, 200)
        }
    }, [disabled, isOpen, setIsOpen])

    const handleToggle = useCallback((e) => {
        if (disabled) return
        if (e.target.closest('.cancel-select')) return
        if (justFocused.current) return

        setIsOpen(!isOpen)
    }, [disabled, isOpen, setIsOpen])

    const handleKeyDown = useCallback((e) => {
        if (e.key == 'Escape') {
            setIsOpen(false)
        }
    }, [setIsOpen])

    return useMemo(() => ({handleBlur, handleFocus, handleToggle, handleKeyDown}),
    [handleBlur, handleFocus, handleToggle, handleKeyDown])
}

export default useSelect