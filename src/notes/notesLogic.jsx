import './notesList.css'

import {useState, useEffect, useMemo, useCallback} from 'react'
import {useShallow} from 'zustand/react/shallow'
import Cookies from 'js-cookie'

import {apiStore, clarifyStore, appStore} from '../store'
import getNotes from './getNotes'
import useDebounce from './useDebounce'

function notesLogic() {
    const offlineMode = apiStore(state => state.offlineMode)
    const online = apiStore(state => state.online)

    // checks for the presence of a token in cookies and local storage
    const token = useMemo(
        () => [localStorage.getItem('token'), Cookies.get('token')]
        .find(
            token => token
        &&
            token !== 'null'
    ))

    // managing windows for deleting, archiving and editing
    const {action, setAction, animating, setAnimating, notesError, notesLoading, notesMessage, category, tag, search, setVisibility, setClarifyLoading, setRetryFunction} = clarifyStore(
        useShallow(state => ({
            setClarifyLoading: state.setClarifyLoading,
            setRetryFunction: state.setRetryFunction,
            setNotesLoading: state.setNotesLoading,
            setNotesMessage: state.setNotesMessage,
            setNotesError: state.setNotesError,
            setVisibility: state.setVisibility,
            notesLoading: state.notesLoading,
            notesMessage: state.notesMessage,
            setAnimating: state.setAnimating,
            notesError: state.notesError,
            setAction: state.setAction,
            animating: state.animating,
            category: state.category,
            action: state.action,
            search: state.search,
            tag: state.tag
    })))

    const {notes} = appStore(useShallow((state) => ({notes: state.notes})))
    //
    const [filteredNotes, setFilteredNotes] = useState((offlineMode || !online || !token) ? notes : null)
    const [elementID, setElementID] = useState('')
    const [lastPage, setLastPage] = useState(0)
    const [page, setPage] = useState(1)

    const debouncedSearch = useDebounce(search, 300)

    const queryString = useMemo(() => {
        const params = []
        
        if (category?.id)
            params.push(`category_id=${category.id}`)
        
        if (tag?.id)
            params.push(`tag_id=${tag.id}`)

        if (search)
            params.push(`q=${debouncedSearch}`)

        params.push(`page=${page}`)
        
        return params.length ? `?${params.join('&')}` : ''
    }, [category?.id, tag?.id, debouncedSearch, page])

    // gets a list of notes from the server
    useEffect(() => {setPage(1)}, [category, tag, debouncedSearch])

    useEffect(() => {
        if (online && !offlineMode && token) {
            getNotes('notes' + queryString, page, setLastPage)
            setFilteredNotes(null)
        }
    }, [queryString, token, offlineMode, online])

    useEffect(() => {
        if (offlineMode || !online || !token) {
            let localData = notes || []

            if (category?.id) {
                localData = localData.filter(note => note.category?.id === category.id)
            }

            if (tag?.id) {
                localData = localData.filter(note => note.tags?.some(t => t.id === tag.id))
            }

            if (debouncedSearch) {
                const q = debouncedSearch.toLowerCase()
                localData = localData.filter(note => 
                    note.title?.toLowerCase().includes(q) || 
                    (note.content && note.content.toLowerCase().includes(q))
                )
            }

            setFilteredNotes(localData)
        }
    }, [debouncedSearch, category, tag, notes, offlineMode, online])

    const loadMore = useCallback(() => {
        if (page < lastPage) {setPage(prev => prev + 1)}
    }, [lastPage])

    const openAnim = useCallback((action) => {
        if (animating == true) {return false}
        setAnimating(true)
        setAction(action)
        setRetryFunction(action)
        setClarifyLoading(true)

        setTimeout(() => {
            setVisibility(true)
        }, 10)

        setTimeout(() => {
            setAnimating(false)
        }, 300)
    }, [animating, setAction, setRetryFunction, setClarifyLoading, setVisibility, setAnimating])

    return useMemo(() => ({notesLoading, notesError, notesMessage, action, elementID, setElementID, getNotes, openAnim, queryString, loadMore, page, lastPage, filteredNotes
    }), [notesLoading, notesError, notesMessage, action, elementID, getNotes, openAnim, queryString, loadMore, page, lastPage, filteredNotes])
}

export default notesLogic