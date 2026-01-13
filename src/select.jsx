import './select.css'

import {useRef, useMemo, useState, useEffect, useCallback} from 'react'
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome'
import {faXmark, faArrowUp as faArrowUpSolid} from '@fortawesome/free-solid-svg-icons'

import {SelectContext} from './selectContext'
import useSelect from './components/useSelect'
import {useSelectLogic, makeId} from './useSelectLogic'
import Options from './components/options'
import SlideLeft from './components/slideLeft'

function Select({children, renderedDropdown, ...props}) {

    const [jsxOptions, setJsxOptions] = useState([])

    const registerOption = useCallback((opt) => {
    setJsxOptions(prev => [...prev, opt])
    }, [])

    const unregisterOption = useCallback((id) => {
        setJsxOptions(prev => prev.filter(o => o.id !== id))
    }, [])

    // ref is needed to pass dimensions for the animation hook
    const selectRef = useRef(null)

    // open/closed status select
    const [visibility, setVisibility] = useState(false)

    const {normalizedOptions, selected, selectOption, clear, hasOptions, active, selectedValue, disabled, loading, error, placeholder, invalidoption, options, value, defaultValue, isControlled, emptyholder, disabledholder, loadingholder, errorholder} = useSelectLogic({...props, visibility, setVisibility,jsxOptions})

    // event handler functions for interacting with the select
    const {handleBlur, handleFocus, handleToggle, handleKeyDown} = useSelect({
        disabled,
        isOpen: visibility,
        setIsOpen: setVisibility
    })

    // displaying title according to state of select
    const title = useMemo(() => {
        if (error) return errorholder
        if (loading) return loadingholder
        if (disabled) return disabledholder
        
        if (selected) return selected.name

        if (selectedValue !== undefined && selectedValue !== null) {
            return typeof selectedValue === 'object' 
                ? (selectedValue.name ?? selectedValue.label ?? String(selectedValue)) 
                : String(selectedValue)
        }

        if (!hasOptions) return emptyholder

        return placeholder
    }, [disabled, loading, error, hasOptions, selected, selectedValue, placeholder])

    const selectId = useMemo(() => `${Math.random().toString(36).substr(2, 9)}`, [])

    const listboxId = `${selectId}-listbox`

    // option list rendering
    const renderOptions = useMemo(() => normalizedOptions?.map((element, index) => {
        const optionId = `option-${makeId(element.name)}-${selectId}`

        let optionClass = 'select-option'
        if (element.className) optionClass += ` ${element.className}`

        if (element.disabled) optionClass += ' --disabled-option'
        
        if (typeof element.raw === 'boolean') {
            optionClass += element.raw ? ' --true-option' : ' --false-option'
        }

        if (element.name == invalidoption) {
            optionClass += ' --invalid-option'
        }

        return (
            <div
                className={optionClass}
                onClick={(e) => selectOption(element, e)}
                key={element.id}
                id={optionId}
                role='option'
                aria-selected={selected?.id === element.id}
                aria-disabled={element.disabled}
            >
                {element.name}
            </div>
        )
    }), [normalizedOptions, selectOption])

    useEffect(() => {
        if (process.env.NODE_ENV !== 'production') {
            
            const receivedType = typeof options
            if (options && typeof options !== 'object') {
                console.error(
                    `%c[Select Library]:%c Invalid prop %coptions%c.\n` +
                    `Expected %cArray%c or %cObject%c, but received %c${receivedType}%c.\n`,
                    'color: #ff4d4f; font-weight: bold;', 'color: default;',
                    'color: #1890ff; font-weight: bold;', 'color: default;',
                    'color: #52c41a; font-weight: bold;', 'color: default;',
                    'color: #52c41a; font-weight: bold;', 'color: default;',
                    'color: #ff4d4f; font-weight: bold;', 'color: default;'
                )
            }

            if (isControlled && defaultValue !== undefined) {
                console.warn(
                    `%c[Select Library]:%c .\n` +
                    ``,
                    'color: #faad14; font-weight: bold;', 'color: default;'
                )
            }
        }
    }, [options, value, defaultValue, isControlled])

    return(
        <div
            className={`select
                ${(!hasOptions || disabled) ? 'disabled-style' : ''}
                ${loading ? 'loading-style' : ''}
                ${error ? 'error-style' : ''}`
            }
            tabIndex={active ? 0 : -1}
            ref={selectRef}
            role='combobox'
            aria-haspopup='listbox'
            aria-expanded={visibility}
            aria-controls={listboxId}
            aria-label={placeholder}
            aria-disabled={disabled || !hasOptions}
            {...(active && {
                onBlur: handleBlur,
                onFocus: handleFocus,
                onClick: handleToggle,
                onKeyDown: handleKeyDown
            })}
        >
            <div
                className={`select-title ${selected?.type == 'boolean'
                    ? selected.raw ? '--true-option' : '--false-option'
                    : ''
                }`}
            >
                {title}
                <SlideLeft
                    visibility={loading && !error}
                >
                    <span className='loading-dots'>
                        <i></i><i></i><i></i>
                    </span>
                </SlideLeft>
            </div>
            <div
                className='select-buttons'
            >
                <SlideLeft
                    visibility={(selectedValue !== null && selectedValue !== undefined) && hasOptions && !disabled && !loading & !error}
                >
                    <FontAwesomeIcon
                        className='select-cancel'
                        icon={faXmark}
                        role='button'
                        aria-label='Clear selection'
                        onClick={(e) => clear(e)}
                    />
                </SlideLeft>
                <SlideLeft
                    visibility={active}
                >
                    <span
                        className={`select-arrow-wrapper
                            ${visibility ? '--open' : ''}
                            ${(!hasOptions || disabled) ? 'disabled-style' : ''}
                            ${loading ? 'loading-style' : ''}
                            ${error ? 'error-style' : ''}`
                        }
                    >
                        <FontAwesomeIcon
                            className='select-arrow-wrapper'
                            icon={faArrowUpSolid}
                        />
                    </span>
                </SlideLeft>
            </div>
            <Options
                visibility={visibility}
                selectRef={selectRef}
            >
                <div
                    className='select-list'
                    role='listbox'
                    aria-label='Options'
                    style={{
                        '--select-border': visibility ? '2px solid #2a2f38' : '2px solid transparent',
                        '--select-background': visibility ? '#1f1f1f' : 'transparent',
                        '--opacity': visibility ? 1 : 0
                    }}
                >
                    {renderOptions}
                </div>
            </Options>

            <SelectContext.Provider
                value={{registerOption, unregisterOption}}
            >
                {children}
                {renderedDropdown}
            </SelectContext.Provider>
        </div>
    )
}

export default Select