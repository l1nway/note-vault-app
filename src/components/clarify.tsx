import './clarify.css'

import {forwardRef, useImperativeHandle, useState, useMemo, useCallback, JSX} from 'react'
import {useTranslation} from 'react-i18next'

import ClarifyView from './clarifyView'
import useClarifyLogic from './useClarifyLogic'

interface ClarifyProps {
    color: string | null
    setColor: (value: string | null) => void
    [key: string]: any
}

interface ClarifyRef {
    change: (context: any) => void
}

const Clarify = forwardRef<ClarifyRef, ClarifyProps>((props, ref) => {

    const {t} = useTranslation()

    const logic = useClarifyLogic(props)

    const {state} = logic
    const {loadingError} = state

    // color storage (used only for categories)
    type color = string
    
    const colors: color[] = useMemo(() =>  ['#1E90FF', '#32CD32', '#8A2BE2', '#FF8C00', '#FF1493', '#008B8B', '#3CB371', '#DC143C', '#9370DB', '#66CDAA'], [])

    // for the future; implement saving of the last used colors
    const [recentColors, setRecentColors] = useState<{id: number, color: string}[]>([
        {id: 1, color: '#1E90FF'}
    ])

    const selectColor = useCallback((value: color) => {
        props.color == value ? props.setColor(null) : props.setColor(value)
    }, [props.color, props.setColor])

    // displays a list of colors
    const renderColors: JSX.Element[] = useMemo(() => 
        colors.map((value: color, index: number) => 
            <label
                className='color-element'
                style={{'--color-value' : value} as React.CSSProperties}
                tabIndex={0}
                key={index}
            >
                <input
                    disabled={loadingError}
                    className='color-radio'
                    type='radio'
                    name='color'
                    checked={props.color == value}
                    onClick={() => selectColor(value)}
                    onChange={() => selectColor(value)}
                />
            </label>
    ), [colors, loadingError, props.color, props.setColor])
    // 

    // change() function from <Clarify/>; call is available if an error occurred while saving, to try again
    useImperativeHandle(ref, () => ({
        change: (context) => logic.actions.change(context)
    }))

    return (
        <ClarifyView 
            t={t} 
            logic={logic} 
            props={props} 
            renderColors={renderColors}
        />
    )
})

export default Clarify