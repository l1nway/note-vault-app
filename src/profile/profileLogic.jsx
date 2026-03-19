import {useState, useRef, useEffect, useCallback} from 'react'
import {profileStore, apiStore, appStore} from '../store'
import {useShallow} from 'zustand/react/shallow'
import Cookies from 'js-cookie'
import './profile.css'

function profileLogic() {
    
    const token = localStorage.getItem('token') || Cookies.get('token') || ''
    const {offlineMode, setOfflineMode} = appStore()
    const {online} = apiStore()

    const {setProfileLoading, setProfileError, setProfileMessage, setTempFile, setFileError, setAvatar} = profileStore(
        useShallow((state) => ({
            setProfileMessage: state.setProfileMessage,
            setProfileLoading: state.setProfileLoading,
            setProfileError: state.setProfileError,
            setFileError: state.setFileError,
            setTempFile: state.setTempFile,
            setAvatar: state.setAvatar,
        }))
    )

    // status of file dragging
    const [drag, setDrag] = useState(false)

    // ref for drag&drop file upload
    const fileRef = useRef(null)

    //

    // func for drag&drop file in input
    const handleFile = useCallback((uploaded) => {
        // checks if it is an image, if not, shows an error
        if (!uploaded || !uploaded.type || !uploaded.type.startsWith('image/')) {
            setFileError(true)
            // sets a timer after which the error message will disappear
            setTimeout(() => setFileError(false), 7000)

            return
        }
        
        // to be sure
        setFileError(false)
        setTempFile(uploaded)
        // const dt = new DataTransfer()
        // dt.items.add(uploaded)
        // fileRef.current.files = dt.files
    }, [])
    
    // request to the server to delete the avatar
    const delAvatar = useCallback(() => {
        fetch(`${import.meta.env.VITE_API_URL}/profile/avatar`, {
            method: 'DELETE',
            headers: {'Authorization': `Bearer ${token}`}
        })
        .then(res => {return res.json()})
        .then(() => {setAvatar(null)})
        .catch(err => console.error('Delete error:', err))
    }, [token])
    
    useEffect(() => {
        if (online) {
            setOfflineMode(false)
        }

        if (!online && !offlineMode) {
            setProfileError(true)
            setProfileMessage('No internet connection')
            setProfileLoading(false)
        }
        
        if (!token) {
            setProfileLoading(false)
            return
        }

        if (offlineMode) {
            setProfileError(false)
            setProfileLoading(false)
        }
    }, [online, offlineMode, token])

    return {drag, setDrag, fileRef, handleFile, delAvatar}
}

export default profileLogic