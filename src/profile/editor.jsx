import {useState, useRef, useEffect, forwardRef, useCallback} from 'react'
import {useGesture} from '@use-gesture/react'
import {useTranslation} from 'react-i18next'
import AvatarEditor from 'react-avatar-editor'
import Cookies from 'js-cookie'

import {FontAwesomeIcon} from '@fortawesome/react-fontawesome'
import {faTrash as faTrashSolid} from '@fortawesome/free-solid-svg-icons'
import {faRotateRight as faRotateRightSolid} from '@fortawesome/free-solid-svg-icons'
import {faRotateLeft as faRotateLeftSolid} from '@fortawesome/free-solid-svg-icons'

import {profileStore} from '../store'
import {editorStore} from '../store'

import SlideDown from '../components/slideDown'
import {useShallow} from 'zustand/react/shallow'

const Editor = forwardRef((props, ref) => {

    const {t} = useTranslation()

    const token = localStorage.getItem('token') || Cookies.get('token') || ''

    const {visible, setVisible} = editorStore()

    const {tempFile, setTempFile, setAvatar} = profileStore(
        useShallow((state) => ({
            setTempFile: state.setTempFile,
            setAvatar: state.setAvatar,
            tempFile: state.tempFile
        }))
    )

    //

    // пока хз буду ли доделывать в итоге
    const [annotation, setAnnotation] = useState('')

    // ref needed to transfer the image
    const editor = useRef(null)
    const avatarContainer = useRef(null)

    // state for area where editor is placed
    const editorAreaRef = useRef()

    //

    // states for editor
    const [zoom, setZoom] = useState(1)
    const [rotate, setRotate] = useState(0)

    //

    const MIN_ZOOM = 1
    const MAX_ZOOM = 2
    const zoomRef = useRef(1)

    const bindPinch = useGesture(
    {
        onPinchStart: () => {
            zoomRef.current = zoom
        },

        onPinch: ({movement: [mscale]}) => {
            let nextZoom = zoomRef.current * mscale
            if (nextZoom > MAX_ZOOM) nextZoom = MAX_ZOOM
            if (nextZoom < MIN_ZOOM) nextZoom = MIN_ZOOM
            setZoom(nextZoom)
        }

    }, {
        pinch: {
            scaleBounds: {min: MIN_ZOOM, max: MAX_ZOOM},
            rubberband: true
        }
    })

    // func for rotating preview image
    const turn = useCallback((dir) => {
        setRotate(prevRotate => {
            const start = prevRotate;
            let target = start + (dir === 'left' ? -90 : 90)

            if (target > 180) target = 180
            if (target < -180) target = -180
            
            if (target === start) return start

            const dur = 300
            let t0
            const ease = p => p < 0.5 ? 2*p*p : -1+(4-2*p)*p

            const anim = t => {
                t0 ||= t
                const p = Math.min((t - t0) / dur, 1)
                const currentVal = start + (target - start) * ease(p)
                
                setRotate(currentVal)
                
                if (p < 1) requestAnimationFrame(anim)
            }

            requestAnimationFrame(anim)
            
            return start
        })
    }, [])

    const setPic = useCallback(() => {
        const canvas = editor.current.getImageScaledToCanvas()

        canvas.toBlob(blob => {
            if (!blob) return

            const formData = new FormData()
            
            formData.append('file', blob, 'avatar.jpg')

            fetch(`http://localhost:3000/api/v1/profile/avatar`, {
                headers: {authorization: `Bearer ${token}`},
                method: 'POST',
                body: formData
            })
            .then(res => {
                if (!res.ok) throw new Error('Upload failed')
                return res.json()
            })
            .then(resData => {
                const fullUrl = `http://localhost:3000${resData.avatar_url}`
                
                setRotate(0)
                setZoom(1)
                setAvatar(fullUrl)
                
                setVisible(false)
                setTimeout(() => setTempFile(null), 400)
            })
            .catch(err => {
                console.error('Error uploading avatar:', err)
            })
        }, 'image/jpeg', 0.9) 
    }, [token])

    // func for reseting all values
    const reset = useCallback(() => {
        setTimeout(() => setTempFile(null), 350)
        setVisible(false)
        setRotate(0)
        setZoom(1)
    }, [])

    useEffect(() => {
        const container = avatarContainer.current
        if (!container) return
        const preventScroll = e => e.preventDefault()

        container.addEventListener('touchmove', preventScroll, {passive: false})

        return () => container.removeEventListener('touchmove', preventScroll)
    }, [])

    useEffect(() => {
        const anotations = {
            // messages in case the turn has reached 180 degrees
            [-180]: 'You can no longer rotate the image to the left.',
            [180]: 'You can no longer rotate the image to the right.'
        }

        setAnnotation(anotations[rotate])
    }, [rotate])

    return(
        <div
            className={`image-editor ${visible ? 'visible' : ''}`}
            ref={ref}
            onClick={
                visible ? () => {
                    setVisible(false)
                    setTimeout(() => setTempFile(null), 350)
                } : null}
        >
            <div
                onClick={(e) => e.stopPropagation()}
                className='editor-block'
            >
                <div
                    className='editor-area'
                    ref={editorAreaRef}
                    tabIndex='0'
                >
                    <div
                        style={{touchAction: 'none'}}
                        className='editor-content'
                        ref={avatarContainer}
                        {...bindPinch()}
                    >
                        <FontAwesomeIcon
                            className='left-rotate'
                            style={{
                                '--bc-color' : rotate == -180 ? 'gray' : '#5ea500',
                                '--color' : rotate == -180 ? '#444' : 'white',
                                '--hover' : rotate == -180 ? 'gray' : '#3e6c00',
                                '--rotate': `${rotate}deg`
                            }}
                            onClick={() => turn('left')}
                            icon={faRotateLeftSolid}
                        />
                        <div className='avatar-editor'>
                            <AvatarEditor
                                crossOrigin='anonymous'
                                onLoadSuccess={() => setAnnotation('The image can only be square. If your image has a different aspect ratio, you can move it to fit the desired image into the square.')}
                                // onImageChange={() => setAnnotation('For a specific angle of rotation and scaling of the image, you can use the sliders below')}
                                width={512}
                                height={512}
                                image={tempFile}
                                borderRadius={500}
                                border={0}
                                scale={zoom}
                                rotate={rotate}
                                backgroundColor='gray'
                                ref={editor}
                            />
                        </div>
                        <FontAwesomeIcon
                            className='right-rotate'
                            style={{
                                '--bc-color' : rotate == 180 ? 'gray' : '#5ea500',
                                '--color' : rotate == 180 ? '#444' : 'white',
                                '--hover' : rotate == 180 ? 'gray' : '#3e6c00',
                                '--rotate': `${rotate}deg`
                            }}
                            onClick={() => turn('right')}
                            icon={faRotateRightSolid}
                        />
                        <FontAwesomeIcon
                            onClick={() => reset()}
                            className='trash-icon'
                            icon={faTrashSolid}
                        />
                    </div>
                    <SlideDown
                        visibility={annotation}
                    >
                        <div
                            className='editor-help'
                        >
                            <span
                                // вообще анимацией предусмотрено что текст может меняться, но я не придумал грамотного использования
                                key={annotation}
                                className='help-text'
                            >
                                {t(annotation)}
                            </span>
                        </div>
                    </SlideDown>
                </div>
                <label className='editor-zoom'>
                    <span className='zoom-title'>
                        {t('zoom')}
                    </span>
                    <input
                        onChange={(e) => setZoom(+e.target.value)}
                        className='zoom-range'
                        value={zoom}
                        type='range'
                        step='0.01'
                        min='1'
                        max='2'
                    />
                </label>
                <label className='editor-rotate'>
                    <span className='rotate-title'>
                        {t('rotate')}
                    </span>
                    <input
                        onChange={(e) => setRotate(+e.target.value)}
                        className='rotate-range'
                        value={rotate}
                        type='range'
                        min='-180'
                        max='180'
                        step='1'
                    />
                </label>

                <button
                    onClick={() => setPic()}
                    className='save-button'
                >
                    {t('save')}
                </button>
                <button
                    className='cancel-button'
                    onClick={() => {
                        setVisible(false)
                        setTimeout(() =>
                            setTempFile(null), 310)
                    }}
                >
                    {t('cancel')}
                </button>
                <button
                    className='delete-button'
                    onClick={() => reset()}
                >
                    {t('delete')}
                </button>
            </div>
        </div>
    )
})

export default Editor