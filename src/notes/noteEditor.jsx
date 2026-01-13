import {useState, useRef, useEffect, useMemo, useCallback} from 'react'
import {useLocation, useNavigate} from 'react-router'
import {useShallow} from 'zustand/react/shallow'
import Cookies from 'js-cookie'

import {apiStore, appStore} from '../store'

import useApi from './useApi'
import {shake} from '../components/shake'

function NoteEditor() {
    const location = useLocation()
    const navigate = useNavigate()
    const online = apiStore(state => state.online)
    
    const {offlineMode, setOfflineMode, offlineCategories, offlineTags, setNotes, addOfflineActions, notes, setIsSyncing, categories, setCategories, setTags} = appStore(useShallow((state) => ({
        offlineMode: state.offlineMode,
        setOfflineMode: state.setOfflineMode,
        offlineCategories: state.offlineCategories,
        offlineTags: state.offlineTags,
        setNotes: state.setNotes,
        addOfflineActions: state.addOfflineActions,
        notes: state.notes,
        setIsSyncing: state.setIsSyncing,
        categories: state.categories,
        setCategories: state.setCategories,
        setTags: state.setTags,
    })))

    const token = useMemo(() => {
        return [
            localStorage.getItem('token'),
            Cookies.get('token')
        ].find(t => t && t !== 'null')
    }, [])
    
    const {createNote, getNote, editNote, getTags, getCategories} = useApi(token)
    
    const catsDisabled = useMemo(
        () => (categories?.length ?? 0) == 0,
        [categories]
    , [categories])

    const placeholder = useMemo(() => catsDisabled ? {name: 'No categories created'} : {name: 'Category not selected'}, [catsDisabled])
    
    // 
    const inputRef = useRef(null)
    const selectRef = useRef(null)
    const tagRef = useRef(null)
    const markdownRef = useRef(null)

    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [textareaFocus, setTextareaFocus] = useState(false)

    const [errors, setErrors] = useState({
        input: false,
        inputMessage: 'Field cannot be empty',
        global: false,
        globalMessage: false,
        categories: false,
        tags: false,
        tagsMessage: 'Loading tags'
    })

    const [note, setNote] = useState({
        name: '',
        content: '',
        category: {name: 'Loading categories'},
        categories: [],
        tags: [],
        selectedTags: [],
        markdown: false
    })

    const [visibility, setVisibility] = useState({
        category: false,
        tags: false,
        markdown: false
    })

    const noteData = useMemo(() => ({
        title: note.name,
        content: note.content,
        is_markdown: note.markdown,
        category_id: note.category.id,
        category: note.category.name == 'Category not selected' ? null : note.category,
        tags: note.selectedTags,
        tag_ids: note?.selectedTags?.map(t => t.id)
    }), [note.name, note.content, note.markdown, note.category, note.selectedTags])

    // creating new note
    const newNote = useCallback(async () => {
        // offline creation
        if (offlineMode || !online) {
            const tempId = Date.now()
            // sync and offline flags for UI, syncAction -- for offline synchronization
            setNotes(notes => [{
                    ...noteData,
                    id: tempId,
                    tempId,
                    offline: true,
                    syncing: false,
                    syncAction: 'create',
                    created_at: new Date().toISOString(),
            }, ...notes])
            // adding a queue to offline synchronization
            addOfflineActions({
                type: 'create',
                entity: 'notes',
                payload: {tempId, ...noteData}
            })
            // flag is set that synchronization does not occur
            setIsSyncing(false)
            navigate('/notes')
            return
        }
        // online creation
        if (online) {
            const tempId = Date.now()
            try {
                // flagging that saving is occurring
                setSaving(true)
                // optimistic note creation
                // setNotes(notes => [{
                //     ...noteData,
                //     id: tempId,
                //     tempId,
                //     syncing: true,
                //     syncAction: 'create',
                //     created_at: new Date().toISOString(),
                // }, ...notes])

                // server responds successfully -- the synchronization flag is removed
                const serverNote = await createNote(noteData)

                setNotes(prev =>
                    prev.map(note =>
                        note.tempId == tempId
                        ? {
                            ...note,
                            ...serverNote,
                            id: serverNote.id,
                            tempId: null,
                            syncing: false,
                            syncAction: null,
                        }
                        : note
                ))
            
            navigate('/notes')
            } catch (error) {
                // server responds with an error -- an error flag is set
                setNotes(prev =>
                    prev.map(note =>
                        note.tempId == tempId
                        ? {
                            ...note,
                            syncing: false,
                            error: true,
                            }
                        : note
                ))
                setErrors(prev => ({
                    ...prev,
                    input: true,
                    inputMessage: error.message
                }))
                shake(inputRef.current)
            } finally {
                setSaving(false)
        }}
    }, [offlineMode, online, noteData, setNotes, addOfflineActions, setIsSyncing, navigate, createNote])

    const modifyNote = useCallback(async () => {
        if (offlineMode || !online) {
            const tempId = Date.now()
            setNotes(notes => {
                const index = notes.findIndex(n => 
                    n.id == location.state || (n.tempId && n.tempId == location.state)
                )

                if (index == -1) return notes

                const updatedNote = {
                    ...notes[index],
                    ...noteData,
                    tempId,
                    offline: true,
                    syncing: false,
                    syncAction: 'edit'
                }

                return [
                    updatedNote,
                    ...notes.slice(0, index),
                    ...notes.slice(index + 1)
                ]
            })
            addOfflineActions({
                type: 'edit',
                entity: 'notes',
                payload: {id: location.state, ...noteData}
            })
            navigate('/notes')
            return
        }
        if (online) {
            const setFlags = (id, data) => {
                setNotes(notes =>
                    notes.map(n =>
                        n.id == id
                            ? {...n, ...data}
                            : n
                    )
                )
            }
            try {
                setFlags(location.state, {...noteData, saving: true})
                setSaving(true)
                await editNote(location.state, noteData)
            } catch (error) {
                setErrors(prev => ({
                    ...prev,
                    input: true,
                    inputMessage: error.message
                }))
                setFlags(location.state, {...noteData, saving: false, error: true})
                shake(inputRef.current)
            } finally {
                setSaving(false)
                setFlags(location.state, {...noteData, saving: false, error: false})
                navigate('/notes')
        }
    }}, [offlineMode, online, noteData, setNotes, addOfflineActions, setIsSyncing, navigate, editNote])

    const loadNote = useCallback(async () => {
        try {
            const resData = await getNote(location.state)

            setNote(prev => ({
                ...prev,
                name: resData.title,
                category: resData.category ?? placeholder,
                content: resData.content,
                markdown: resData.is_markdown === 1,
                selectedTags: resData.tags
            }))
            setVisibility(v => ({...v, markdown: resData.is_markdown == 1}))
            setErrors(error => ({...error, global: false}))
        } catch (error) {
            setErrors(prev => ({
                ...prev,
                global: true,
                globalMessage: error
            }))
    }}, [getNote])

    const loadTags = useCallback(async () => {
        try {
            const tags = await getTags()
            setTags(tags)
            setNote(prev => ({...prev, tags}))
            setVisibility(v => ({...v, tags: true}))
            setErrors(prev => ({
            ...prev,
                tags: false,
                tagsMessage: tags?.length == 0 ? 'No tags created' : null
            }))
        } catch {
            setErrors(prev => ({
                ...prev,
                tags: true,
                tagsMessage: 'Error loading tags'
            }))
    }}, [getTags, setTags])

    const loadCats = useCallback(async () => {
        try {
            const categories = await getCategories()
            setCategories(categories)
            setNote(prev => ({
                ...prev,
                categories,
                category: placeholder
            }))
            setErrors(prev => ({
                ...prev,
                categories: false
            }))
        } catch {
            setErrors(prev => ({
                ...prev,
                categories: true
            }))
            setNote(prev => ({
            ...prev,
                category: {name: 'Error loading categories'}
            }))
    }}, [getCategories, setCategories])

    // 
    const markdownTimer = useRef(null)

    const markdownToggle = useCallback(() => {
        clearTimeout(markdownTimer.current)
        if (note.markdown) {
            setVisibility(prev => ({...prev, markdown: false}))
            markdownTimer.current = setTimeout(() => setNote(prev => ({...prev, markdown: false})), 301)
        } else {
            setNote(prev => ({...prev, markdown: true}))
            markdownTimer.current = setTimeout(() => setVisibility(prev => ({...prev, markdown: true})), 10)
        }
    }, [])

    useEffect(() => {
        return () => clearTimeout(markdownTimer.current)
    }, [])

    const loadGroups = useCallback(async () => {
        try {
            await Promise.all([
                location.state ? loadNote() : Promise.resolve(),
                loadCats(),
                loadTags()
            ])
        } catch (e) {
            console.error(e)
        } finally {
            setLoading(false)
    }}, [loadCats, loadTags, loadNote])

    const retryLoad = useCallback(() => {
        setNote(prev => ({
            ...prev,
            category: {name: 'Loading categories'}
        }))
        setErrors(prev => ({
                ...prev,
                global: false,
                categories: true,
                tags: false,
                tagsMessage: 'Loading tags'
            }))
        setLoading(true)
        loadGroups()
    }, [loadGroups])

    //
    const setGeneralError = useCallback((status) => {
        if (status) {
            setLoading(false)

            setNote(prev => ({
                ...prev,
                tags: [],
                categories: [],
                markdown: false
            }))

            setErrors(prev => ({
                ...prev,
                global: true,
                categories: true,
                tags: true,
                tagsMessage: 'Error loading tags',
                globalMessage: 'No internet connection'
            }))

            setVisibility(prev => ({
                ...prev,
                tags: false,
                markdown: false
            }))
        }
    }, [])

    const turnOfflineMode = useCallback(() => {
        setNote(prev => ({
                ...prev,
                category: placeholder,
                categories: offlineCategories,
                tags: offlineTags
            }))
        setVisibility(prev => ({
            ...prev,
            markdown: false,
            tags: true
        }))
        setErrors(prev => ({
            ...prev,
            global: false,
            categories: false,
            tags: false,
            tagsMessage: 'No tags created'
        }))
        setLoading(false)
        
        if (location.state) {
            const offlineNote = notes?.find(n => n.id == location.state)

            if (offlineNote) {
                setNote(prev => ({
                    ...prev,
                    name: offlineNote.title,
                    categories: offlineCategories,
                    category: offlineNote.category ?? placeholder,
                    content: offlineNote.content,
                    markdown: offlineNote.is_markdown == 1,
                    tags: offlineTags,
                    selectedTags: offlineNote.tags
                }))
            }
    }}, [placeholder, offlineCategories, offlineTags, location.state])

    const turnOnlineMode = useCallback(() => {
        setErrors(prev => ({
                ...prev,
                global: false,
                categories: false,
                tags: false,
                tagsMessage: 'Loading tags'
            }))

        setOfflineMode?.(false)
        
        if (token) {
            loadGroups()
        } else {
            setLoading(false)
            setNote(prev => ({
                ...prev,
                category: placeholder
            }))
            setErrors(prev => ({
                ...prev,
                tagsMessage: 'No tags created'
            }))
        }
    }, [loadGroups])

    // triggers the function execution on the first load; checked whether the id is transmitted
    useEffect(() => {
        if (!online && !offlineMode) {
            if (Cookies.get('offline') != 'true') {
                setGeneralError(true)
                return
            }
            setOfflineMode(true)
        }

        if (offlineMode) {
            turnOfflineMode()
            setNote(prev => ({
                ...prev,
                category: placeholder
            }))
        }

        if (online) {
            turnOnlineMode()
        }
    }, [online, offlineMode])

    // function to add and remove a tag
    const selectTag = useCallback((tag) => {
        setNote(prev => {
            const selectedTags = prev.selectedTags ?? []

            const isSelected = selectedTags?.some(t => t.id == tag.id)
            const newSelectedTags = isSelected
                ? selectedTags.filter(t => t.id !== tag.id)
                : [...selectedTags, tag]

            return {
                ...prev,
                selectedTags: newSelectedTags
    }})}, [])

    const clearInputs = useCallback(() => {
        setNote(prev => ({
            ...prev,
            name: '',
            category: placeholder,
            content: '',
            markdown: false,
            selectedTags: []
    }))}, [])

    useEffect(() => {
        if (errors.categories) {
            setNote(prev => ({
                ...prev,
                category: {name: 'Error loading categories'}
            }))
        }
    }, [errors.categories])

    const state = useMemo(() => ({loading, errors, saving, note, visibility, textareaFocus}), [loading, errors, saving, note, visibility, textareaFocus])

    const actions = useMemo(() => ({setErrors, newNote, modifyNote, clearInputs, selectTag, navigate, markdownToggle, loadTags, setLoading, loadCats, retryLoad, setNote, setVisibility, setTextareaFocus}), [newNote, modifyNote, clearInputs, selectTag, navigate, markdownToggle, loadTags, loadCats, retryLoad])

    const refs = useMemo(() => ({inputRef, selectRef, tagRef, markdownRef}), [])

    return {state, actions, refs}
}

export default NoteEditor