import Cookies from 'js-cookie'
import {clarifyStore, appStore} from '../store'

const getGroups = async (path, setErrorMessage = () => {}) => {
    const {setTagsError, setCategoriesError, setTagsLoading, setCategoriesLoading} = clarifyStore.getState()
    const {setCategories, setTags} = appStore.getState()

    const setGroups = (value) => {
        if (path == 'tags') setTags(value)
        else setCategories(value)
    }

    const setLoadingError = (value) => {
        if (path == 'tags') setTagsError(value)
        else setCategoriesError(value)
    }

    const setLoading = (value) => {
        if (path == 'tags') setTagsLoading(value)
        else setCategoriesLoading(value)
    }

    const token = [
        localStorage.getItem('token'),
        Cookies.get('token')
    ].find(
        token => token
    &&
        token !== 'null'
    )
    
    setLoading(true)
    setLoadingError(false)
    try {
        const res = await fetch(`https://api.notevault.pro/api/v1/${path}`, {
            method: 'GET',
            headers: {
                'content-type': 'application/json',
                authorization: `Bearer ${token}`
            }
        })
        if (!res.ok) throw new Error(`${res.status}`)

        const resData = await res.json()
        setGroups(resData)
        setLoadingError(false)
    } catch (error) {
        setErrorMessage(error)
        setLoadingError(true)
    } finally {
        setLoading(false)
    }
}

export default getGroups