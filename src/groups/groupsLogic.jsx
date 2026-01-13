import {useState, useRef, useEffect, useMemo, useCallback} from 'react'
import {useShallow} from 'zustand/react/shallow'
import {useLocation} from 'react-router'
import Cookies from 'js-cookie'

import {clarifyStore, apiStore, appStore} from '../store'
import getGroups from './getGroups'

function groupsLogic() {

    const location = useLocation()
    const path = location.pathname.slice(1)
    
    const token = useMemo(() => ([localStorage.getItem('token'), Cookies.get('token')].find(t => t && t !== 'null')), [])

    // refs for correctly setting focus on the checkbox imitation
    const gridRef = useRef(null)
    const listRef = useRef(null)
    // to call a function from <Clarify/>
    const clarifyRef = useRef()
    
    const online = apiStore(state => state.online)

    const {tags, setTags, categories, setCategories, offlineMode, setOfflineMode} = appStore(
        useShallow(state => ({
            offlineMode: state.offlineMode,
            setOfflineMode: state.setOfflineMode,
            tags: state.tags,
            setTags: state.setTags,
            categories: state.categories,
            setCategories: state.setCategories
    })))

    const {tagsError, categoriesError, setCategoriesError, categoriesLoading, setCategoriesLoading, tagsLoading, setTagsLoading, setTagsError, action, setAction, setVisibility, animating, setAnimating, setClarifyLoading, retryFunction, setRetryFunction, setCurrentElementId} = clarifyStore(
        useShallow(state => ({
            categoriesError: state.categoriesError,
            tagsError: state.tagsError,
            action: state.action,
            setAction: state.setAction,
            setVisibility: state.setVisibility,
            animating: state.animating,
            setAnimating: state.setAnimating,
            categoriesLoading: state.categoriesLoading,
            setCategoriesLoading: state.setCategoriesLoading,
            setCategoriesError: state.setCategoriesError,
            tagsLoading: state.tagsLoading,
            setTagsLoading: state.setTagsLoading,
            setTagsError: state.setTagsError,
            setClarifyLoading: state.setClarifyLoading,
            retryFunction: state.retryFunction,
            setRetryFunction: state.setRetryFunction,
            setCurrentElementId: state.setCurrentElementId
    })))

    const items = useMemo(
        () => (path == 'tags' ? tags : categories),
        [path, tags, categories]
    )
    
    const saving = useMemo(() => items?.some(item => item?.saving), [items])
    const error = useMemo(() => items?.some(item => item?.error), [items])
    
    const loadingError = useMemo(
        () => (path == 'tags' ? tagsError : categoriesError),
        [path, tagsError, categoriesError]
    )

    const setLoadingError = useCallback((value) => {
        if (path == 'tags') setTagsError(value)
        else setCategoriesError(value)
    }, [path, setTagsError, setCategoriesError])

    const loading = useMemo(
        () => (path == 'tags' ? tagsLoading : categoriesLoading),
        [path, tagsLoading, categoriesLoading]
    )

    const setLoading = useCallback((value) => {
        if (path == 'tags') setTagsLoading(value)
        else setCategoriesLoading(value)
    }, [path, setTagsLoading, setCategoriesLoading])

    const [catsView, setCatsView] = useState('grid')
    const listView = useMemo(() => catsView == 'list', [catsView])
    const [errorMessage, setErrorMessage] = useState('')
    const [elementID, setElementID] = useState('')
    const [color, setColor] = useState('')
    const [name, setName] = useState('')

    useEffect(() => {
        if (!online || !token) return
        getGroups(path, setErrorMessage)
    }, [online, token, path])

    useEffect(() => {
        if (!online && Cookies.get('offline') !== 'true') {
            setLoadingError(true)
            setErrorMessage('No internet connection')
            setLoading(false)
        }
    }, [online, setLoadingError, setErrorMessage])

    const openAnim = useCallback((action, id) => {
        if (animating == true) {
            return false
        }
        setAnimating(true)
        setAction(action)
        setRetryFunction(action)
        setClarifyLoading(true)
        setCurrentElementId(id)

        setTimeout(() => {
            setVisibility(true)
        }, 10)

        setTimeout(() => {
            setAnimating(false)
        }, 300)
    }, [animating, setAnimating, setAction, setRetryFunction, setClarifyLoading, setCurrentElementId, setVisibility])
    
    return useMemo(() => ({path, loading, catsView, setCatsView, listView, elementID, setElementID, color, setColor, name, setName, openAnim, retryFunction, action, clarifyRef, gridRef, listRef, setLoadingError, getGroups, errorMessage, loadingError, setErrorMessage, items, saving, error, offlineMode, setOfflineMode, online}),
    [path, loading, catsView, setCatsView, listView, elementID, setElementID, color, setColor, name, setName, openAnim, retryFunction, action, clarifyRef, gridRef, listRef, setLoadingError, getGroups, errorMessage, loadingError, setErrorMessage, items, saving, error, offlineMode, setOfflineMode, online])
}

export default groupsLogic